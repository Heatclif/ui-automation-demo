import { $ } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { WduBasePage } from './WduBasePage.js';

class HomePage extends WduBasePage {
  get heading(): ChainablePromiseElement {
    return $('h1*=Practise');
  }

  get contactUsCard(): ChainablePromiseElement {
    return $('#contact-us');
  }

  async goto(): Promise<void> {
    await browser.url('/index.html');
  }

  async openContactUs(): Promise<void> {
    await this.openChallenge(this.contactUsCard);
  }
}

export default new HomePage();
