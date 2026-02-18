import { test, expect } from "./setup";

test("chat page loads with prompt input", async ({ page }) => {
  await page.goto("/domain");

  // Switch to Training tab
  await page.getByRole("tab", { name: /training/i }).click();

  // Verify the chat interface loaded with a textarea
  const textarea = page.locator("textarea");
  await expect(textarea).toBeVisible({ timeout: 10_000 });
});

test("chat sends and receives message @requires-api-credits", async ({
  page,
}) => {
  test.skip(
    !process.env.ANTHROPIC_API_KEY_FUNDED,
    "Skipped: requires ANTHROPIC_API_KEY_FUNDED=1 env var (Anthropic credits)"
  );

  await page.goto("/domain");
  await page.getByRole("tab", { name: /training/i }).click();

  const textarea = page.locator("textarea");
  await expect(textarea).toBeVisible({ timeout: 10_000 });
  await textarea.fill("What is freight forwarding in one sentence?");
  await textarea.press("Enter");

  await expect(
    page.locator('[data-from="assistant"]').first()
  ).toBeVisible({ timeout: 30_000 });
});
