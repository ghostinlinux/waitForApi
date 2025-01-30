# waitForApi

## Introduction

`waitForApi` is an enhanced version of Playwright's waitForResponse, designed to reliably wait for API responses with built-in retry logic, timeout handling, and detailed error logging. This package helps testers and developers efficiently handle asynchronous API calls during end-to-end (E2E) testing with Playwright.

## Installation

To install `waitForApi`, run:

```sh
npm install waitForApi
```

## Usage

```typescript
import { test } from "@playwright/test";
import { API_METHODS, API_STATUS, waitForApi } from "waitForApi";

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

## We have

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

```
API_METHODS = {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}
```
