import { test as base, expect } from '@playwright/test';
import { LoginPage } from '@saucedemo/pages/LoginPage';
import { InventoryPage } from '@saucedemo/pages/InventoryPage';

type SaucePages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
};

/**
 * SauceDemo per-test fixtures. Tests destructure the page objects they need,
 * e.g. `test('...', async ({ loginPage, inventoryPage }) => { ... })`.
 *
 * Always import `test` and `expect` from this module — never from
 * '@playwright/test' directly — so the page-object fixtures are visible to
 * TypeScript and tests stay funneled through the POM layer.
 */
export const test = base.extend<SaucePages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
});

export { expect };
