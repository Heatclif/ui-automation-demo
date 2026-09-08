import type { Locator, Page } from '@playwright/test';
import { WduBasePage } from './WduBasePage';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  comment: string;
}

export class ContactUsPage extends WduBasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly commentInput: Locator;
  readonly submitButton: Locator;
  readonly resetButton: Locator;
  readonly successHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.emailInput = page.getByRole('textbox', { name: 'Email Address' });
    this.commentInput = page.getByRole('textbox', { name: 'Comments' });
    this.submitButton = page.getByRole('button', { name: 'SUBMIT' });
    this.resetButton = page.getByRole('button', { name: 'RESET' });
    this.successHeader = page.getByRole('heading', {
      name: /thank you for your message!/i,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto('/Contact-Us/contactus.html');
  }

  async fillContactForm(data: ContactFormData): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.commentInput.fill(data.comment);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
