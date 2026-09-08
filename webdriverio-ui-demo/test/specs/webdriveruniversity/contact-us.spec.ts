import { expect } from '@wdio/globals';
import HomePage from '@wdu/pages/HomePage.js';
import ContactUsPage from '@wdu/pages/ContactUsPage.js';

describe('WebDriverUniversity contact form', () => {
  it('submits the contact form from the home page and shows a thank-you screen', async () => {
    await HomePage.goto();
    await HomePage.openContactUs();

    await ContactUsPage.fillContactForm({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      comment: 'Submitting via WebdriverIO POM demo.',
    });
    await ContactUsPage.submit();

    await expect(ContactUsPage.successHeader).toBeDisplayed();
  });
});
