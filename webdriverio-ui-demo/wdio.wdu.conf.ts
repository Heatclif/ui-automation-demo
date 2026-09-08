import { shared } from './wdio.shared.conf.js';

export const config: WebdriverIO.Config = {
  ...shared,
  baseUrl: 'https://webdriveruniversity.com',
  specs: ['./test/specs/webdriveruniversity/**/*.spec.ts'],
  maxInstances: 5,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': { args: ['--headless=new'] },
    },
  ],
};
