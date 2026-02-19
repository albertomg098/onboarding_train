import { test, expect } from "./setup";

test.describe("settings page mobile responsiveness", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("no horizontal overflow on mobile", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Settings")).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
  });

  test("all prompt editor tabs are visible", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("tab", { name: /Domain/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Framework/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Simulation/i })).toBeVisible();
  });

  test("action buttons are visible and not clipped", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: /Export/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Import/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reset/i })).toBeVisible();
  });
});
