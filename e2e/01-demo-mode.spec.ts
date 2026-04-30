/**
 * Test: Demo mode loads the dashboard correctly.
 *
 * When the cookie `consently_demo_mode=true` is present the ConsentProvider
 * short-circuits Supabase auth and loads demo data.  The root page `/` should
 * therefore render the main dashboard (not redirect to /auth).
 */
import { test, expect } from "@playwright/test";
import { gotoDemo } from "./helpers";

test.describe("Demo mode — dashboard", () => {
  test("/ renders the dashboard heading without redirecting to /auth", async ({ page }) => {
    await gotoDemo(page, "/");

    // Should stay on / (not be redirected to /auth)
    await expect(page).not.toHaveURL(/\/auth/);

    // The welcome heading should be visible
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });
  });

  test("dashboard shows 'Welcome back' heading in demo mode", async ({ page }) => {
    await gotoDemo(page, "/");

    // Wait for client-side hydration — the greeting is rendered by the "use client" page
    await expect(
      page.locator("h1", { hasText: /Welcome back/i })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("dashboard renders summary cards (Services Connected, Data Types Shared, High Risk)", async ({
    page,
  }) => {
    await gotoDemo(page, "/");

    // All three SummaryCard labels must appear
    await expect(page.getByText("Services Connected")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Data Types Shared")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("High Risk Services")).toBeVisible({ timeout: 5_000 });
  });

  test("dashboard shows Connect Service and Revoke All buttons", async ({ page }) => {
    await gotoDemo(page, "/");

    await expect(page.getByRole("button", { name: /connect service/i })).toBeVisible({
      timeout: 15_000,
    });
    // Revoke All button exists (may be disabled when no high-risk services)
    await expect(page.getByRole("button", { name: /revoke all/i })).toBeVisible({ timeout: 5_000 });
  });
});
