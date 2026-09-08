import { test, expect } from '@wdu/fixtures/pages.fixture';

test.describe('WebDriverUniversity contact form', () => {
  test('submits the contact form from the home page and shows a thank-you screen', async ({
    homePage,
    contactUsPage,
  }) => {
    await homePage.goto();
    await homePage.openContactUs();

    await contactUsPage.fillContactForm({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      comment: 'Submitting via Playwright POM demo.',
    });
    await contactUsPage.submit();

    await expect(contactUsPage.successHeader).toBeVisible();
  });
});
