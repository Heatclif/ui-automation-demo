import { shared } from './wdio.shared.conf.js';

export const config: WebdriverIO.Config = {
  ...shared,
  baseUrl: 'https://www.saucedemo.com',
  specs: ['./test/specs/saucedemo/**/*.spec.ts'],
  maxInstances: 5,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': { args: ['--headless=new'] },
    },
  ],
};
