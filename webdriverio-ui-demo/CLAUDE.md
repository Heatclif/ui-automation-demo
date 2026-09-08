# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

**Read [docs/CODEBASE_GUIDE.md](docs/CODEBASE_GUIDE.md) first.** It is the source of truth for layout, conventions, and rules. This file is just orientation.

## What this repo is

A multi-website WebdriverIO tech demo, and the TypeScript/WebdriverIO sibling of `playwright-ui-demo`. Same sites, same POM philosophy, adapted to WebdriverIO idioms (singleton page objects, `expect-webdriverio` assertions, per-site `wdio.<site>.conf.ts` instead of Playwright projects).

Currently covered sites:

- **SauceDemo** — `https://www.saucedemo.com`
- **WebDriverUniversity** — `https://webdriveruniversity.com`

## Commands

```bash
npm ci

npm test                        # Both sites, sequentially
npm run test:saucedemo          # SauceDemo only
npm run test:wdu                # WebDriverUniversity only
npm run typecheck               # tsc --noEmit

npx wdio run ./wdio.saucedemo.conf.ts --spec ./test/specs/saucedemo/login.spec.ts
```

## Architecture (one-paragraph)

`wdio.shared.conf.ts` holds options common to every site; `wdio.saucedemo.conf.ts` and `wdio.wdu.conf.ts` each spread it and set their own `baseUrl` + `specs` glob — the WebdriverIO analogue of a Playwright project. Page objects live in `src/websites/<site>/pages/` and extend a per-site `*BasePage` for the `helper` and shared locators; each page-object module's only export is a ready-made singleton instance. Specs live in `test/specs/<site>/` and import page objects and `expect`/`browser`/`$`/`$$` from `@wdio/globals`. Cross-site, non-native operations live as a small set of methods on `src/helpers/ElementHelper.ts`. Type-safe path aliases (`@helpers/*`, `@saucedemo/*`, `@wdu/*`) are configured in `tsconfig.json`.

## Where to go next

- Conventions, locator strategy, POM rules, naming: [docs/CODEBASE_GUIDE.md](docs/CODEBASE_GUIDE.md)
- Short do/don't checklist + "what files to touch" recipes: [.cursor/skills/wdio-pom/SKILL.md](.cursor/skills/wdio-pom/SKILL.md)

## CI

`.github/workflows/wdio.yml` runs `npm test` on push/PR to `main`/`master` and uploads on-failure screenshots as an artifact for 30 days.
