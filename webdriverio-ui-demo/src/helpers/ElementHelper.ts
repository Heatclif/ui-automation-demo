import type { ChainablePromiseElement } from 'webdriverio';

/**
 * Cross-site helper for operations WebdriverIO doesn't expose natively.
 *
 * Rule of thumb: try the native WebdriverIO API first
 *   - element.click()                          → before jsClick
 *   - element.scrollIntoView()                 → before jsScrollIntoView
 *   - element.getCSSProperty(prop)              → covers getComputedStyle natively (kept
 *                                                  here only as a thin wrapper for call-site
 *                                                  consistency with the other helpers)
 *   - (no native "open target=_blank in place")  → openSameTab
 *
 * Only fall back to jsClick/jsScrollIntoView when the native API genuinely
 * doesn't fit (e.g. overlay intercepts the click, link has target="_blank"
 * and you want the navigation in-place).
 *
 * The helper takes no constructor arguments — every method operates on a
 * `ChainablePromiseElement`, WebdriverIO's lazy element handle.
 */
export class ElementHelper {
  /**
   * Click via JS `element.click()`, bypassing WebdriverIO's actionability
   * checks. Useful when an animation or overlay intercepts a real click but
   * the element is functionally present.
   *
   * Why non-native: WebdriverIO's `click()` scrolls into view and waits for
   * the element to be clickable; there is no built-in escape hatch short of
   * dropping to a raw DOM click.
   */
  async jsClick(el: ChainablePromiseElement): Promise<void> {
    await browser.execute((elem) => (elem as HTMLElement).click(), await el);
  }

  /**
   * Scroll the element to the centre of the viewport.
   *
   * Why non-native: WebdriverIO's `scrollIntoView()` defaults to
   * `block: 'start'`, which often leaves elements pinned under a sticky
   * header or footer.
   */
  async jsScrollIntoView(
    el: ChainablePromiseElement,
    block: ScrollLogicalPosition = 'center',
  ): Promise<void> {
    await browser.execute(
      (elem, b) => elem.scrollIntoView({ block: b as ScrollLogicalPosition, inline: 'center' }),
      await el,
      block,
    );
  }

  /** Read a single resolved CSS property from an element. Native since WDIO's
   * `getCSSProperty` already parses the computed value — this wrapper exists
   * only so every helper is called the same way from page objects. */
  async getComputedStyle(el: ChainablePromiseElement, property: string): Promise<string> {
    const result = await el.getCSSProperty(property);
    return String(result.value);
  }

  /**
   * Click a link that has `target="_blank"` and have the navigation happen
   * in the current tab rather than spawning a new window.
   *
   * Why non-native: WebdriverIO's native pattern for a new tab is
   * `browser.getWindowHandles()` / `browser.switchToWindow()`, which forces
   * every test that follows such a link to juggle window handles. For sites
   * where this is pervasive (e.g. WebDriverUniversity's challenge cards),
   * stripping `target` keeps tests linear.
   */
  async openSameTab(link: ChainablePromiseElement): Promise<void> {
    await browser.execute((el) => el.removeAttribute('target'), await link);
    await link.click();
  }
}
