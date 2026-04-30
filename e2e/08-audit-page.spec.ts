/**
 * Test: /audit page renders without crashing.
 */
import { test, expect } from "@playwright/test";
import { gotoDemo } from "./helpers";

test.describe("/audit page", () => {
  test("renders the Privacy Health Check heading", async ({ page }) => {
    await gotoDemo(page, "/audit");

    await expect(
      page.locator("h1", { hasText: /Privacy Health Check/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test("shows the Privacy Health Check badge", async ({ page }) => {
    await gotoDemo(page, "/audit");

    // There are two "Privacy Health Check" texts — the badge and the h1
    await expect(page.getByText(/Privacy Health Check/).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("shows summary cards (Potential Risks, Recent Activity, Trusted Services, Privacy Health)", async ({
    page,
  }) => {
    await gotoDemo(page, "/audit");

    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText("Potential Risks", { exact: true })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Recent Activity", { exact: true })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Trusted Services", { exact: true })).toBeVisible({ timeout: 5_000 });
    // The SummaryCard label text is "Privacy Health" — use exact match to avoid hitting the heading
    await expect(page.getByText("Privacy Health", { exact: true })).toBeVisible({ timeout: 5_000 });
  });

  test("shows the 'Enable Continuous Guard' button", async ({ page }) => {
    await gotoDemo(page, "/audit");

    await expect(
      page.getByRole("button", { name: /Enable Continuous Guard/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test("clicking 'Enable Continuous Guard' triggers scanning and does not crash", async ({
    page,
  }) => {
    await gotoDemo(page, "/audit");

    const guardBtn = page.getByRole("button", { name: /Enable Continuous Guard/i });
    await expect(guardBtn).toBeVisible({ timeout: 20_000 });
    await guardBtn.click();

    // Button should switch to "Scanning..." state
    await expect(
      page.getByRole("button", { name: /Scanning/i })
    ).toBeVisible({ timeout: 3_000 });

    // Heading should still be visible (no crash)
    await expect(
      page.locator("h1", { hasText: /Privacy Health Check/i })
    ).toBeVisible();
  });

  test("shows Filter Report button", async ({ page }) => {
    await gotoDemo(page, "/audit");

    await expect(
      page.getByRole("button", { name: /Filter Report/i })
    ).toBeVisible({ timeout: 20_000 });
  });
});
