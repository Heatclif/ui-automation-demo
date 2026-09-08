import type { Locator, Page } from '@playwright/test';
import { ElementHelper } from '@helpers/ElementHelper';

/**
 * Base for every WebDriverUniversity page object.
 *
 * Deliberately thin: WDU challenges share very little markup beyond the
 * top nav. The base exists for the helper plumbing and for the
 * `openChallenge` action, which is used to navigate from the home page
 * into a challenge in the same tab (every challenge link is
 * `target="_blank"`).
 */
export abstract class WduBasePage {
  protected readonly helper: ElementHelper;

  readonly headerLogo: Locator;

  constructor(protected readonly page: Page) {
    this.helper = new ElementHelper();
    this.headerLogo = page.getByRole('link', { name: /webdriveruniversity\.com/i });
  }

  /**
   * Strips target="_blank" before clicking so the challenge loads in-place,
   * and waits for the new document to be ready before returning. The
   * explicit `waitForLoadState` is the sync point — without it, follow-up
   * actions can race the in-flight navigation under parallel load.
   */
  async openChallenge(linkLocator: Locator): Promise<void> {
    await this.helper.openSameTab(linkLocator);
    await this.page.waitForLoadState('domcontentloaded');
  }
}
