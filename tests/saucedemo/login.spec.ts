import { test, expect } from '@saucedemo/fixtures/pages.fixture';
import { STANDARD_USER } from '@saucedemo/data/users';

test.describe('SauceDemo login', () => {
  test('standard user logs in and lands on the products page', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.login(STANDARD_USER);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.inventoryItems).not.toHaveCount(0);
  });
});
