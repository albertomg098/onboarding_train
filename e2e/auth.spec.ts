import { test, expect } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

test("unauthenticated user redirects to sign-in", async ({ page }) => {
  await setupClerkTestingToken({ page });
  await page.goto("/");
  await expect(page).toHaveURL(/sign-in/);
});
