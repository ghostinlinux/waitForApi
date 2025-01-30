import { Page, APIResponse } from "@playwright/test";

/**
 * Enum representing supported HTTP methods.
 */
export enum API_METHODS {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

/**
 * Enum representing common HTTP status codes.
 */
export enum API_STATUS {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Enum representing common error messages.
 */
enum ERROR_MESSAGES {
  TIMEOUT = "API request timed out",
  FETCH_ERROR = "Error fetching API response",
  MAX_ATTEMPTS_REACHED = "API call failed after maximum attempts",
}

/** Default timeout for API calls (in milliseconds). */
const DEFAULT_API_TIMEOUT = 10000; // 10 seconds

/** Default maximum retry attempts for API calls. */
const DEFAULT_MAX_ATTEMPTS = 2;

/**
 * Waits for an API response that matches the given URL, status, and HTTP method.
 *
 * @param {Object} params - API request details.
 * @param {string} params.url - The API endpoint to validate.
 * @param {API_STATUS} params.status - Expected HTTP response status.
 * @param {API_METHODS} params.apiCallType - Expected HTTP method (GET, POST, etc.).
 * @param {Page} params.page - Playwright Page instance.
 * @returns {Promise<APIResponse>} The matched API response.
 */
async function validateAPIResponse({
  url,
  status,
  apiCallType,
  page,
}: {
  url: string;
  status: API_STATUS;
  apiCallType: API_METHODS;
  page: Page;
}): Promise<APIResponse> {
  return page.waitForResponse(
    (response) =>
      response.url().includes(url) &&
      [status, API_STATUS.NO_CONTENT].includes(response.status()) &&
      response.request().method() === apiCallType
  ) as unknown as APIResponse;
}

/**
 * Waits for a successful API response with retries if necessary.
 *
 * @param {Object} params - API request details.
 * @param {string} params.endpoint - API endpoint to call.
 * @param {API_STATUS} params.status - Expected HTTP response status.
 * @param {API_METHODS} params.requestMethod - HTTP method (GET, POST, etc.).
 * @param {Page} params.page - Playwright Page instance.
 * @param {number} [params.API_TIMEOUT=10000] - Timeout per attempt (default: 10s).
 * @param {number} [params.MAX_ATTEMPTS=2] - Maximum retry attempts (default: 2).
 * @returns {Promise<APIResponse>} The successful API response.
 * @throws {Error} Throws an error if the API call fails after all attempts.
 */
export async function waitForApi({
  endpoint,
  status,
  requestMethod,
  page,
  API_TIMEOUT = DEFAULT_API_TIMEOUT,
  MAX_ATTEMPTS = DEFAULT_MAX_ATTEMPTS,
}: {
  endpoint: string;
  status: API_STATUS;
  requestMethod: API_METHODS;
  page: Page;
  API_TIMEOUT?: number;
  MAX_ATTEMPTS?: number;
}) {
  for (let attempts = 1; attempts <= MAX_ATTEMPTS; attempts++) {
    try {
      const response = await Promise.race([
        validateAPIResponse({
          url: endpoint,
          status,
          apiCallType: requestMethod,
          page,
        }),
        timeout(API_TIMEOUT),
      ]);
      return response;
    } catch (error) {
      const responseStatus = await fetchStatus(page, endpoint, requestMethod);
      if (attempts > 2) {
        console.error(
          `❌ [Error] Attempt ${attempts}/${MAX_ATTEMPTS} | Endpoint: ${endpoint} | Expected: ${status} | Received: ${responseStatus} | Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      if (attempts < MAX_ATTEMPTS) {
        console.log("🔄 Retrying after page reload...");
        await page.reload();
      }
    }
  }
  throw new Error(`🚨 ${ERROR_MESSAGES.MAX_ATTEMPTS_REACHED}`);
}

/**
 * Fetches the status of an API endpoint for debugging purposes.
 *
 * @param {Page} page - Playwright Page instance.
 * @param {string} endpoint - The API endpoint to check.
 * @param {API_METHODS} method - HTTP method (GET, POST, etc.).
 * @returns {Promise<string>} The HTTP status as a string or an error message.
 */
async function fetchStatus(
  page: Page,
  endpoint: string,
  method: API_METHODS
): Promise<string> {
  try {
    const response = await page.request.fetch(endpoint, { method });
    return response ? response.status().toString() : "Unknown";
  } catch {
    return ERROR_MESSAGES.FETCH_ERROR;
  }
}

/**
 * Handles API timeout.
 *
 * @param {number} ms - Timeout duration in milliseconds.
 * @returns {Promise<never>} A rejected promise with a timeout error.
 */
async function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(ERROR_MESSAGES.TIMEOUT)), ms)
  );
}
