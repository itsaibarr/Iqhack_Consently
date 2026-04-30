import { Page } from "@playwright/test";

/**
 * Sets the demo-mode cookie so the app bypasses Supabase auth and loads
 * seed data for the demo user.
 */
export async function setDemoModeCookie(page: Page) {
  await page.context().addCookies([
    {
      name: "consently_demo_mode",
      value: "true",
      domain: "localhost",
      path: "/",
    },
  ]);
}

/**
 * Navigates to a URL after ensuring the demo cookie is set.
 */
export async function gotoDemo(page: Page, path: string) {
  await setDemoModeCookie(page);
  await page.goto(path);
}

/**
 * Marks the onboarding as complete in localStorage so the overlay doesn't
 * intercept pointer events on the dashboard.  Call this after gotoDemo() has
 * navigated to the page and the JS context is available.
 */
export async function dismissOnboarding(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("consently_onboarding_done", "true");
  });
  // Reload so React re-reads localStorage and skips the OnboardingFlow
  await page.reload();
}
