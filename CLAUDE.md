# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (also installs Playwright browsers)
npm ci
npx playwright install --with-deps

# Run all tests (across chromium, firefox, webkit)
npx playwright test

# Run tests in a specific browser
npx playwright test --project=chromium

# Run a single test file
npx playwright test tests/example.spec.ts

# Run a single test by name
npx playwright test -g "has title"

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Open HTML report after a test run
npx playwright show-report

# Run tests in UI mode (interactive test runner)
npx playwright test --ui
```

There are no npm scripts defined — use `npx playwright` directly.

## Architecture

This is a pure Playwright end-to-end test suite with no application code. The repo contains only test files and configuration.

- **`playwright.config.ts`** — central config: test directory is `./tests`, HTML reporter, traces collected on first retry, `fullyParallel: true` locally (CI forces `workers: 1` and 2 retries). Three browser projects are active: `chromium`, `firefox`, `webkit`.
- **`tests/`** — all spec files live here (flat, no subdirectory structure currently). Each file uses `@playwright/test` directly with no shared fixtures or page-object layer yet.
- **CI** (`.github/workflows/playwright.yml`) — runs on push/PR to `main`/`master`, uploads the HTML report as an artifact for 30 days.

No `baseURL` is configured, so tests navigate to full URLs. No `webServer` block — tests hit live/external URLs, not a locally-served app.
