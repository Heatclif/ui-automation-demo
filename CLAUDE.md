# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

**Read [docs/CODEBASE_GUIDE.md](docs/CODEBASE_GUIDE.md) first.** It is the source of truth for layout, conventions, and rules. This file is just orientation.

## What this repo is

A multi-website Playwright tech demo. The framework is structured so adding a new website is a recipe, not a redesign.

Currently covered sites:

- **SauceDemo** — `https://www.saucedemo.com`
- **WebDriverUniversity** — `https://webdriveruniversity.com`

## Commands

```bash
npm ci
npx playwright install --with-deps

npm test                        # All projects
npm run test:saucedemo          # SauceDemo only
npm run test:wdu                # WebDriverUniversity only
npm run test:ui                 # Interactive UI mode
npm run test:headed             # Headed browsers
npm run test:report             # Open the HTML report
npm run typecheck               # tsc --noEmit

npx playwright test tests/saucedemo/login.spec.ts     # Single file
npx playwright test -g "standard user logs in"        # Single test by name
npx playwright test --debug                            # Inspector
```

## Architecture (one-paragraph)

`playwright.config.ts` defines one project per website (chromium-only by default; firefox/webkit are kept commented). Each project sets its own `baseURL` and, where useful, `testIdAttribute` (SauceDemo uses `data-test`). Page objects live in `src/websites/<site>/pages/` and extend a per-site `*BasePage` for the `helper` and shared locators. Tests live in `tests/<site>/` and import `test`/`expect` from the site's `src/websites/<site>/fixtures/pages.fixture.ts`, which is a `test.extend` that wires up the page objects. Cross-site, non-native operations live as a small set of methods on `src/helpers/ElementHelper.ts`. Type-safe path aliases (`@helpers/*`, `@saucedemo/*`, `@wdu/*`) are configured in `tsconfig.json`.

## Where to go next

- Conventions, locator strategy, POM rules, naming: [docs/CODEBASE_GUIDE.md](docs/CODEBASE_GUIDE.md)
- Short do/don't checklist + "what files to touch" recipes: [.cursor/skills/playwright-pom/SKILL.md](.cursor/skills/playwright-pom/SKILL.md)

## CI

`.github/workflows/playwright.yml` runs `npx playwright test` on push/PR to `main`/`master` and uploads the HTML report as an artifact for 30 days.
