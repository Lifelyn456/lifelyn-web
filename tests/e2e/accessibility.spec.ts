import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Every route that is reachable without a session. Protected routes redirect to /login (the app
// fails closed), so they cannot be audited without a live API; see docs/ARCHITECTURE.md.
const PUBLIC_ROUTES = ["/", "/login", "/register"];

for (const path of PUBLIC_ROUTES) {
  test(`${path} has no WCAG 2.1 A or AA violations`, async ({ page }) => {
    // The app honours prefers-reduced-motion. Without it, colours are measured mid-animation.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const summary = results.violations.map(
      (violation) =>
        `[${violation.impact}] ${violation.id}: ${violation.help} (${violation.nodes.length} nodes, first: ${violation.nodes[0]?.target.join(" ")})`,
    );
    expect(summary, summary.join("\n")).toEqual([]);
  });
}

test("the page can be used with the keyboard alone: the first Tab stop is a real control", async ({
  page,
}) => {
  await page.goto("/login");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const element = document.activeElement;
    return element
      ? { tag: element.tagName, visible: element.getBoundingClientRect().width > 0 }
      : null;
  });
  expect(focused).not.toBeNull();
  expect(["A", "BUTTON", "INPUT"]).toContain(focused?.tag);
  expect(focused?.visible).toBe(true);
});
