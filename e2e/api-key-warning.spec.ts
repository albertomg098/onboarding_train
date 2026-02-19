import { test, expect } from "./setup";

test("shows warning alert when API key is invalid", async ({ page }) => {
  // Mock the API key check to return invalid
  await page.route("**/api/settings/api-key", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ valid: false, source: "none" }),
    })
  );

  await page.goto("/");
  const main = page.locator("main");

  const alert = main.locator('[role="alert"]');
  await expect(alert).toBeVisible({ timeout: 10_000 });
  await expect(alert).toContainText("API key");

  // Should have a link to settings
  const settingsLink = alert.locator('a[href="/settings"]');
  await expect(settingsLink).toBeVisible();
});

test("shows warning when API key check fails", async ({ page }) => {
  await page.route("**/api/settings/api-key", (route) =>
    route.abort("connectionrefused")
  );

  await page.goto("/");
  const main = page.locator("main");

  const alert = main.locator('[role="alert"]');
  await expect(alert).toBeVisible({ timeout: 10_000 });
  await expect(alert).toContainText("API key");
});

test("does not show warning when API key is valid", async ({ page }) => {
  // Mock the API key check to return valid
  await page.route("**/api/settings/api-key", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ valid: true, source: "server" }),
    })
  );

  await page.goto("/");
  const main = page.locator("main");

  // Wait for content to load, then confirm no alert
  await expect(main.getByText("Traza Training Hub")).toBeVisible();
  await expect(main.locator('[role="alert"]')).not.toBeVisible();
});
