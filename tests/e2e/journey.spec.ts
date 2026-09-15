import { expect, test } from "@playwright/test";

test("Freighter is the only login and protected routes fail closed", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Sign in with Freighter" })).toBeVisible();
  await expect(page.getByText("Freighter is the only login method")).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  // The client-side route guard can replace the URL before goto reaches its
  // load event, which Playwright reports as ERR_ABORTED even though the guard
  // behaved correctly.
  await page.goto("/dashboard", { waitUntil: "commit" }).catch(() => undefined);
  await expect(page).toHaveURL(/\/login$/);
});
