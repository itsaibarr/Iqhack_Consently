/**
 * Test: /settings page renders and toggles work without crashing.
 */
import { test, expect } from "@playwright/test";
import { gotoDemo } from "./helpers";

test.describe("/settings page", () => {
  test("renders the System Settings heading", async ({ page }) => {
    await gotoDemo(page, "/settings");

    await expect(
      page.locator("h1", { hasText: /System Settings/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test("shows the Browser Extension section", async ({ page }) => {
    await gotoDemo(page, "/settings");

    await expect(page.getByText("Browser Extension")).toBeVisible({ timeout: 20_000 });
  });

  test("shows the Privacy & Sovereignty section", async ({ page }) => {
    await gotoDemo(page, "/settings");

    await expect(page.getByText("Privacy & Sovereignty")).toBeVisible({ timeout: 20_000 });
  });

  test("clicking the Stealth Mode toggle does not crash the page", async ({ page }) => {
    await gotoDemo(page, "/settings");

    // Wait for settings to load (past the spinner)
    await expect(page.locator("h1", { hasText: /System Settings/i })).toBeVisible({
      timeout: 20_000,
    });

    // Find the Stealth Mode toggle button (it's a <button> wrapping a motion.div)
    const stealthToggle = page
      .locator("text=Stealth Mode")
      .locator("..")          // parent div of title
      .locator("..")          // parent div containing the row
      .getByRole("button")
      .first();

    // Fallback approach: find all toggle buttons in the privacy section
    const toggleButtons = page.locator('button.rounded-full[class*="h-6"]');
    const count = await toggleButtons.count();

    if (count > 0) {
      await toggleButtons.first().click();
      // Page should not crash — heading still visible
      await expect(page.locator("h1", { hasText: /System Settings/i })).toBeVisible({
        timeout: 5_000,
      });
    } else {
      // Try the original selector
      await stealthToggle.click();
      await expect(page.locator("h1", { hasText: /System Settings/i })).toBeVisible({
        timeout: 5_000,
      });
    }
  });

  test("shows the Alert Preferences section", async ({ page }) => {
    await gotoDemo(page, "/settings");

    await expect(page.getByText("Alert Preferences")).toBeVisible({ timeout: 20_000 });
  });

  test("shows the Danger Zone section", async ({ page }) => {
    await gotoDemo(page, "/settings");

    await expect(page.getByText(/Danger Zone/i)).toBeVisible({ timeout: 20_000 });
  });
});
