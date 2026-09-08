import type { Locator, Page } from '@playwright/test';
import { WduBasePage } from './WduBasePage';

export class HomePage extends WduBasePage {
  readonly heading: Locator;
  readonly contactUsCard: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', {
      name: /practise test automation on a real site/i,
    });
    this.contactUsCard = page.getByRole('link', { name: /contact us form/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/index.html');
  }

  async openContactUs(): Promise<void> {
    await this.openChallenge(this.contactUsCard);
  }
}
