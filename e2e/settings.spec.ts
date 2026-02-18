import { test, expect } from "./setup";

test("settings page loads with expected sections", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByText("API Key", { exact: true })).toBeVisible();
  await expect(page.getByText("Prompt Editor", { exact: true })).toBeVisible();
});
