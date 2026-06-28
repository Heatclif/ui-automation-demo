import type { Locator, Page } from '@playwright/test';
import { ElementHelper } from '@helpers/ElementHelper';

/**
 * Base for every SauceDemo page object.
 *
 * Holds locators and actions that genuinely repeat across the site —
 * primarily the header burger menu and the shopping-cart link (both
 * present once the user is authenticated). Pre-login pages still extend
 * this base for the `helper` and `page` plumbing.
 */
export abstract class SauceBasePage {
  protected readonly helper: ElementHelper;

  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(protected readonly page: Page) {
    this.helper = new ElementHelper();
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.shoppingCartLink = page.getByTestId('shopping-cart-link');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
  }

  async openMenu(): Promise<void> {
    await this.burgerMenuButton.click();
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async openCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  /** Returns 0 when the badge is absent (empty cart). */
  async cartBadgeCount(): Promise<number> {
    if ((await this.shoppingCartBadge.count()) === 0) return 0;
    return Number(await this.shoppingCartBadge.innerText());
  }
}
