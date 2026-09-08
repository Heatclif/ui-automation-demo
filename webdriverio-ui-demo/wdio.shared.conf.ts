/**
 * Options common to every site. Each site gets its own wdio.<site>.conf.ts
 * that spreads this and overrides `baseUrl` + `specs` — the WebdriverIO
 * equivalent of a Playwright "project" (see docs/CODEBASE_GUIDE.md §2).
 *
 * Chromium-only by default, matching the Playwright sibling repo. Add a
 * `firefox` entry to `capabilities` per site when cross-browser is needed.
 */
export const shared: Omit<WebdriverIO.Config, 'baseUrl' | 'specs' | 'capabilities'> = {
  runner: 'local',
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
  reporters: ['spec'],
  logLevel: 'warn',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // Only on failure — mirrors the Playwright config's on-failure artifacts.
  afterTest: async (test, _context, result) => {
    if (result.passed) return;
    await browser.saveScreenshot(`./errorShots/${test.parent}-${test.title}.png`);
  },
};
