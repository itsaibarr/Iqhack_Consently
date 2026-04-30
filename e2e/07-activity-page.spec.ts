/**
 * Test: /activity page renders without crashing.
 */
import { test, expect } from "@playwright/test";
import { gotoDemo } from "./helpers";

test.describe("/activity page", () => {
  test("renders the Permission History heading", async ({ page }) => {
    await gotoDemo(page, "/activity");

    await expect(
      page.locator("h1", { hasText: /Permission History/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test("shows the 'Your History' badge", async ({ page }) => {
    await gotoDemo(page, "/activity");

    await expect(page.getByText(/Your History/i)).toBeVisible({ timeout: 15_000 });
  });

  test("shows filter buttons for ALL, GRANTED, REVOKED", async ({ page }) => {
    await gotoDemo(page, "/activity");

    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await expect(page.getByRole("button", { name: /^All$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Granted$/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Revoked$/i })).toBeVisible();
  });

  test("clicking the REVOKED filter does not crash the page", async ({ page }) => {
    await gotoDemo(page, "/activity");

    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: /^Revoked$/i }).click();

    // Page heading still visible after filter interaction
    await expect(
      page.locator("h1", { hasText: /Permission History/i })
    ).toBeVisible({ timeout: 5_000 });
  });

  test("shows Account Security card", async ({ page }) => {
    await gotoDemo(page, "/activity");

    await expect(page.getByText("Account Security")).toBeVisible({ timeout: 20_000 });
  });
});
