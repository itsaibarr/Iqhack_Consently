/**
 * Test: /map page loads and does NOT display the old "Handshake Active" jargon.
 * It should show "Watching for new requests" (or similar) instead.
 */
import { test, expect } from "@playwright/test";
import { gotoDemo } from "./helpers";

test.describe("/map page", () => {
  test("renders the Privacy Map heading", async ({ page }) => {
    await gotoDemo(page, "/map");

    await expect(
      page.locator("h1", { hasText: /Your Privacy Map/i })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("does NOT contain 'Handshake Active' jargon", async ({ page }) => {
    await gotoDemo(page, "/map");

    // Wait for content to be rendered
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });

    // The old jargon phrase must not appear anywhere on the page
    const handshakeText = page.locator("text=Handshake Active");
    await expect(handshakeText).toHaveCount(0);
  });

  test("shows 'Watching for new requests' status text", async ({ page }) => {
    await gotoDemo(page, "/map");

    await expect(
      page.getByText(/Watching for new requests/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test("shows Live Connection Map badge", async ({ page }) => {
    await gotoDemo(page, "/map");

    await expect(
      page.getByText(/Live Connection Map/i)
    ).toBeVisible({ timeout: 15_000 });
  });
});
