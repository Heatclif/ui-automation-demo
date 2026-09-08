import { $ } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { SauceBasePage } from './SauceBasePage.js';
import type { SauceUser } from '../data/users.js';

/**
 * Exported as a ready-made singleton (WebdriverIO's recommended POM
 * pattern, since `browser`/`$` are already global — there's no per-test
 * `page` handle to inject like in Playwright). Never `new LoginPage()` in a
 * spec; import this default export instead.
 */
class LoginPage extends SauceBasePage {
  get usernameInput(): ChainablePromiseElement {
    return $('[data-test="username"]');
  }

  get passwordInput(): ChainablePromiseElement {
    return $('[data-test="password"]');
  }

  get loginButton(): ChainablePromiseElement {
    return $('[data-test="login-button"]');
  }

  get errorMessage(): ChainablePromiseElement {
    return $('[data-test="error"]');
  }

  async goto(): Promise<void> {
    await browser.url('/');
  }

  async login(user: SauceUser): Promise<void> {
    await this.usernameInput.setValue(user.username);
    await this.passwordInput.setValue(user.password);
    await this.loginButton.click();
  }
}

export default new LoginPage();
