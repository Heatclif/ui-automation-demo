import { $, $$ } from '@wdio/globals';
import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio';
import { SauceBasePage } from './SauceBasePage.js';

class InventoryPage extends SauceBasePage {
  get title(): ChainablePromiseElement {
    return $('[data-test="title"]');
  }

  get inventoryItems(): ChainablePromiseArray {
    return $$('[data-test="inventory-item"]');
  }

  /** Click "Add to cart" on the inventory card whose name matches `itemName`. */
  async addItemToCart(itemName: string): Promise<void> {
    const items = await this.inventoryItems;
    for (const item of items) {
      if ((await item.getText()).includes(itemName)) {
        await item.$('button*=Add to cart').click();
        return;
      }
    }
    throw new Error(`No inventory item found matching "${itemName}"`);
  }
}

export default new InventoryPage();
