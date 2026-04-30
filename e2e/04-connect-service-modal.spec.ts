/**
 * Test: Connect Service modal opens with name and URL fields.
 */
import { test, expect } from "@playwright/test";
import { gotoDemo, dismissOnboarding } from "./helpers";

test.describe("Connect Service modal", () => {
  test.beforeEach(async ({ page }) => {
    await gotoDemo(page, "/");
    // Dismiss the onboarding overlay so it doesn't intercept pointer events.
    // The overlay checks localStorage, so we set the flag and reload.
    await dismissOnboarding(page);
    // Wait for dashboard to hydrate before interacting
    await expect(
      page.getByRole("button", { name: /connect service/i })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("clicking 'Connect Service' opens the modal", async ({ page }) => {
    await page.getByRole("button", { name: /connect service/i }).click();

    // The dialog should be visible
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
  });

  test("modal has aria-modal and correct title", async ({ page }) => {
    await page.getByRole("button", { name: /connect service/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    await expect(dialog).toHaveAttribute("aria-modal", "true");

    // Heading inside the dialog
    await expect(dialog.locator("h2", { hasText: /Connect Service/i })).toBeVisible();
  });

  test("modal contains Service Name and Website URL fields", async ({ page }) => {
    await page.getByRole("button", { name: /connect service/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Name input (required)
    await expect(dialog.locator("#service-name")).toBeVisible();
    // URL input (optional)
    await expect(dialog.locator("#service-url")).toBeVisible();
  });

  test("Connect button is disabled when name field is empty", async ({ page }) => {
    await page.getByRole("button", { name: /connect service/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    const connectBtn = dialog.getByRole("button", { name: /^connect$/i });
    await expect(connectBtn).toBeDisabled();
  });

  test("Connect button becomes enabled after typing a service name", async ({ page }) => {
    await page.getByRole("button", { name: /connect service/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    await dialog.locator("#service-name").fill("Acme Corp");
    const connectBtn = dialog.getByRole("button", { name: /^connect$/i });
    await expect(connectBtn).toBeEnabled();
  });

  test("pressing Escape closes the modal", async ({ page }) => {
    await page.getByRole("button", { name: /connect service/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden({ timeout: 3_000 });
  });

  test("clicking Cancel closes the modal", async ({ page }) => {
    await page.getByRole("button", { name: /connect service/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    await dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(dialog).toBeHidden({ timeout: 3_000 });
  });
});
