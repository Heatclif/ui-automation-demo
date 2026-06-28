import type { Locator } from '@playwright/test';

/**
 * Cross-site helper for operations Playwright doesn't expose natively.
 *
 * Rule of thumb: try the native Playwright API first
 *   - locator.click()                          → before jsClick
 *   - locator.scrollIntoViewIfNeeded()         → before jsScrollIntoView
 *   - expect(locator).toHaveCSS(prop, value)   → before getComputedStyle
 *   - context.waitForEvent('page')             → before openSameTab
 *
 * Only fall back to these helpers when the native API genuinely doesn't fit
 * (e.g. overlay intercepts the click, link has target="_blank" and you want
 * the navigation in-place).
 *
 * The helper takes no constructor arguments — every method operates on a
 * `Locator`, which already carries a reference to its Page.
 */
export class ElementHelper {
  /**
   * Click via JS `element.click()`, bypassing Playwright's actionability
   * checks. Useful when an animation or overlay intercepts a real click but
   * the element is functionally present.
   *
   * Why non-native: Playwright's `click()` enforces visibility, stability,
   * and pointer-event hit-testing. There is no built-in escape hatch beyond
   * `force: true`, which still requires the element to be visible.
   */
  async jsClick(locator: Locator): Promise<void> {
    await locator.evaluate((el) => (el as HTMLElement).click());
  }

  /**
   * Scroll the element to the centre of the viewport.
   *
   * Why non-native: Playwright's `scrollIntoViewIfNeeded()` uses
   * `block: 'nearest'`, which often leaves elements pinned to a sticky
   * header or footer.
   */
  async jsScrollIntoView(
    locator: Locator,
    block: ScrollLogicalPosition = 'center',
  ): Promise<void> {
    await locator.evaluate(
      (el, b) => el.scrollIntoView({ block: b, inline: 'center' }),
      block,
    );
  }

  /**
   * Read a single resolved CSS property from an element.
   *
   * Why non-native: `expect(locator).toHaveCSS()` only asserts; it doesn't
   * return the value. Useful when a test needs to branch on a computed
   * style (e.g. derived theme colours).
   */
  async getComputedStyle(locator: Locator, property: string): Promise<string> {
    return locator.evaluate(
      (el, prop) => window.getComputedStyle(el as Element).getPropertyValue(prop),
      property,
    );
  }

  /**
   * Click a link that has `target="_blank"` and have the navigation happen
   * in the current Page rather than spawning a new tab.
   *
   * Why non-native: Playwright's native pattern is
   * `context.waitForEvent('page')` to capture the new tab, which forces
   * every test that follows such a link to juggle two Page objects. For
   * sites where this is pervasive (e.g. WebDriverUniversity's challenge
   * cards), stripping `target` keeps tests linear.
   */
  async openSameTab(linkLocator: Locator): Promise<void> {
    await linkLocator.evaluate((el) => {
      if (el instanceof HTMLAnchorElement) {
        el.removeAttribute('target');
      }
    });
    await linkLocator.click();
  }
}
