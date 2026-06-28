import { test as base, expect } from '@playwright/test';
import { HomePage } from '@wdu/pages/HomePage';
import { ContactUsPage } from '@wdu/pages/ContactUsPage';

type WduPages = {
  homePage: HomePage;
  contactUsPage: ContactUsPage;
};

/**
 * WebDriverUniversity per-test fixtures.
 *
 * Always import `test` and `expect` from this module — never from
 * '@playwright/test' directly — so the page-object fixtures are visible to
 * TypeScript and tests stay funneled through the POM layer.
 */
export const test = base.extend<WduPages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  contactUsPage: async ({ page }, use) => {
    await use(new ContactUsPage(page));
  },
});

export { expect };
