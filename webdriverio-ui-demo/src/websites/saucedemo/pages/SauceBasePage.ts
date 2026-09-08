import { $ } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { ElementHelper } from '@helpers/ElementHelper.js';

/**
 * Base for every SauceDemo page object.
 *
 * Holds locators and actions that genuinely repeat across the site —
 * primarily the header burger menu and the shopping-cart link (both
 * present once the user is authenticated). Pre-login pages still extend
 * this base for the `helper` plumbing.
 *
 * Locators are `get` accessors, not constructor-assigned fields: page
 * objects are default-exported singletons created at module-import time,
 * before WebdriverIO's browser session exists, and `$()` throws if called
 * before a session is active. A getter defers the `$()` call until a test
 * actually reads the property.
 */
export abstract class SauceBasePage {
  protected readonly helper = new ElementHelper();

  get burgerMenuButton(): ChainablePromiseElement {
    return $('#react-burger-menu-btn');
  }

  get logoutLink(): ChainablePromiseElement {
    return $('[data-test="logout-sidebar-link"]');
  }

  get shoppingCartLink(): ChainablePromiseElement {
    return $('[data-test="shopping-cart-link"]');
  }

  get shoppingCartBadge(): ChainablePromiseElement {
    return $('[data-test="shopping-cart-badge"]');
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
    if (!(await this.shoppingCartBadge.isExisting())) return 0;
    return Number(await this.shoppingCartBadge.getText());
  }
}
