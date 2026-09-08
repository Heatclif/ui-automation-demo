import { $ } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { ElementHelper } from '@helpers/ElementHelper.js';

/**
 * Base for every WebDriverUniversity page object.
 *
 * Deliberately thin: WDU challenges share very little markup beyond the
 * top nav. The base exists for the helper plumbing and for the
 * `openChallenge` action, which is used to navigate from the home page
 * into a challenge in the same tab (every challenge link is
 * `target="_blank"`).
 *
 * Locators are `get` accessors, not constructor-assigned fields — see
 * SauceBasePage for why (singletons are created before a browser session
 * exists, and `$()` requires one).
 */
export abstract class WduBasePage {
  protected readonly helper = new ElementHelper();

  get headerLogo(): ChainablePromiseElement {
    return $('#nav-title');
  }

  /**
   * Strips target="_blank" before clicking so the challenge loads in-place,
   * and waits for the new document to be ready before returning. The
   * explicit wait is the sync point — without it, follow-up actions can
   * race the in-flight navigation.
   */
  async openChallenge(link: ChainablePromiseElement): Promise<void> {
    await this.helper.openSameTab(link);
    await browser.waitUntil(
      async () => (await browser.execute(() => document.readyState)) === 'complete',
      { timeout: 10000, timeoutMsg: 'Challenge page did not finish loading' },
    );
  }
}
