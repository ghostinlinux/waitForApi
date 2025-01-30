# waitforapi

## Introduction

`waitforapi` is an enhanced version of Playwright's waitForResponse, designed to reliably wait for API responses with built-in retry logic, timeout handling, and detailed error logging. This package helps testers and developers efficiently handle asynchronous API calls during end-to-end (E2E) testing with Playwright.

## Installation

To install `waitforapi`, run:

```sh
npm install waitforapi
```

## Usage

```typescript
/**
 * waitForApi(params: { endpoint, status: API_STATUS, requestMethod: API_METHODS, page, API_TIMEOUT?, MAX_ATTEMPTS? })
 * Default API Timeout: 10000ms (10 seconds)
 * Default Max Attempts: 2
 * Waits for a successful API response.
 */

await waitForApi({
  endpoint: "https://api.example.com/data",
  status: API_STATUS.OK,
  requestMethod: API_METHODS.GET,
  page: page,
  API_TIMEOUT: 5000, // Default is 10 seconds
  MAX_ATTEMPTS: 4, // Default is 2
});
```

## Example

```typescript
import { test } from "@playwright/test";
import { API_METHODS, API_STATUS, waitForApi } from "waitforapi";

test("get started link", async ({ page }) => {
  await page.goto(
    "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"
  );
  const waitEndpoint =
    "https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/dashboard/employees/locations";

  const emailLocator = page.getByPlaceholder("Username");
  const passwordLocator = page.getByPlaceholder("Password");
  const loginLocator = page.getByRole("button", { name: "LOGIN" });

  await emailLocator.fill("Admin");
  await passwordLocator.fill("admin123");
  await loginLocator.click();

  await waitForApi({
    endpoint: waitEndpoint,
    status: API_STATUS.OK,
    requestMethod: API_METHODS.GET,
    page: page,
    API_TIMEOUT: 5000, // The Default value is set to 10 Sec
    MAX_ATTEMPTS: 4, // The Default value is set to 2
  });
});
```

## Supported HTTP status codes:

```
API_STATUS = {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
```

## Supported HTTP methods:

```
API_METHODS = {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}
```
