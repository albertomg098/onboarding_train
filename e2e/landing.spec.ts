import { test, expect } from "./setup";

test("landing page shows 3 modules", async ({ page }) => {
  await page.goto("/");
  const main = page.locator("main");
  await expect(main.getByText("Domain Knowledge", { exact: true })).toBeVisible();
  await expect(main.getByText("Mental Framework", { exact: true })).toBeVisible();
  await expect(main.getByText("Scenario Simulation", { exact: true })).toBeVisible();
});

test("module card links to correct route", async ({ page }) => {
  await page.goto("/");
  // The card is a link containing "Start Learning" — click the link directly
  await page.locator('a[href="/domain"]').first().click();
  await expect(page).toHaveURL("/domain", { timeout: 10_000 });
});
