import type { Locator, Page } from '@playwright/test';
import { SauceBasePage } from './SauceBasePage';

export class InventoryPage extends SauceBasePage {
  readonly title: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.inventoryItems = page.getByTestId('inventory-item');
  }

  /** Click "Add to cart" on the inventory card whose name matches `itemName`. */
  async addItemToCart(itemName: string): Promise<void> {
    const card = this.inventoryItems.filter({ hasText: itemName });
    await card.getByRole('button', { name: /add to cart/i }).click();
  }
}
