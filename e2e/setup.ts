import { test as base } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";

export const test = base.extend({
  page: async ({ page }, use) => {
    await setupClerkTestingToken({ page });
    await page.goto("/sign-in");
    await clerk.signIn({
      page,
      emailAddress: process.env.TEST_EMAIL!,
    });

    // clerk.signIn sets the session but doesn't redirect —
    // navigate to home and confirm we're not redirected back to sign-in
    await page.goto("/");
    await page.waitForURL(/^(?!.*sign-in)/, { timeout: 15_000 });

    await use(page);
  },
});

export { expect } from "@playwright/test";
