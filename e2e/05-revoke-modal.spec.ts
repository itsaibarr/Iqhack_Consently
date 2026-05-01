/**
 * Test: Revoke modal opens from inventory CompanyCard with correct ARIA attributes.
 *
 * The inventory page renders CompanyCards for every active service.
 * Each card has a "Revoke" button.  Clicking it opens the RevokeConfirmModal
 * which must have role="dialog" and aria-modal="true".
 */
import { test, expect } from "@playwright/test";
import { gotoDemo } from "./helpers";

test.describe("Revoke confirmation modal", () => {
  test.beforeEach(async ({ page }) => {
    await gotoDemo(page, "/inventory");
    // Wait for company cards to render — looking for any "Revoke" button
    await expect(page.getByRole("button", { name: /revoke/i }).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("clicking Revoke on a card opens a dialog with role=dialog and aria-modal=true", async ({
    page,
  }) => {
    // Click the first visible Revoke button
    const revokeBtn = page.getByRole("button", { name: /^revoke consent/i }).first();
    await revokeBtn.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  test("revoke dialog has aria-labelledby pointing to a title", async ({ page }) => {
    await page.getByRole("button", { name: /^revoke consent/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // aria-labelledby must reference an element that is visible
    const labelledBy = await dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();

    const titleEl = page.locator(`#${labelledBy}`);
    await expect(titleEl).toBeVisible();
  });

  test("revoke dialog contains a reason dropdown", async ({ page }) => {
    await page.getByRole("button", { name: /^revoke consent/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // The select element with revoke reasons should be present
    const select = dialog.locator("select");
    await expect(select).toBeVisible();
  });

  test("pressing Escape closes the revoke dialog", async ({ page }) => {
    await page.getByRole("button", { name: /^revoke consent/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden({ timeout: 3_000 });
  });

  test("clicking Cancel in the revoke dialog closes it", async ({ page }) => {
    await page.getByRole("button", { name: /^revoke consent/i }).first().click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Cancel button is inside the dialog footer
    await dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(dialog).toBeHidden({ timeout: 3_000 });
  });
});
