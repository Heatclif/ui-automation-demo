import { $ } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { WduBasePage } from './WduBasePage.js';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  comment: string;
}

class ContactUsPage extends WduBasePage {
  get firstNameInput(): ChainablePromiseElement {
    return $('input[name="first_name"]');
  }

  get lastNameInput(): ChainablePromiseElement {
    return $('input[name="last_name"]');
  }

  get emailInput(): ChainablePromiseElement {
    return $('input[name="email"]');
  }

  get commentInput(): ChainablePromiseElement {
    return $('textarea[name="message"]');
  }

  get submitButton(): ChainablePromiseElement {
    return $('input.contact_button[type="submit"]');
  }

  get resetButton(): ChainablePromiseElement {
    return $('input.contact_button[type="reset"]');
  }

  // Text-only selector: robust to whatever element wraps the message
  // (mirrors the "getByText" fallback rung in the locator strategy).
  get successHeader(): ChainablePromiseElement {
    return $('*=Thank You for your Message');
  }

  async goto(): Promise<void> {
    await browser.url('/Contact-Us/contactus.html');
  }

  async fillContactForm(data: ContactFormData): Promise<void> {
    await this.firstNameInput.setValue(data.firstName);
    await this.lastNameInput.setValue(data.lastName);
    await this.emailInput.setValue(data.email);
    await this.commentInput.setValue(data.comment);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}

export default new ContactUsPage();
