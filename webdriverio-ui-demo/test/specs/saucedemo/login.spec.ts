import { expect } from '@wdio/globals';
import LoginPage from '@saucedemo/pages/LoginPage.js';
import InventoryPage from '@saucedemo/pages/InventoryPage.js';
import { STANDARD_USER } from '@saucedemo/data/users.js';

describe('SauceDemo login', () => {
  it('standard user logs in and lands on the products page', async () => {
    await LoginPage.goto();
    await LoginPage.login(STANDARD_USER);

    expect(await browser.getUrl()).toContain('/inventory.html');
    await expect(InventoryPage.title).toHaveText('Products');
    await expect(InventoryPage.inventoryItems).toBeElementsArrayOfSize({ gte: 1 });
  });
});
