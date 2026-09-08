---
name: playwright-pom
description: Authoring rules for this multi-website Playwright POM framework (SauceDemo, WebDriverUniversity). Use when adding or editing tests under tests/, page objects or fixtures under src/websites/, or helpers under src/helpers/, and whenever asked to add a new website, page, or spec.
---

# Playwright POM (this repo)

The **source of truth** is [docs/CODEBASE_GUIDE.md](../../../docs/CODEBASE_GUIDE.md). Read it before authoring or modifying anything under `tests/`, `src/websites/`, or `src/helpers/`. The rules below are a compressed checklist.

## Do / don't

**Do**

- Put new page objects under `src/websites/<site>/pages/`, extending the site's `*BasePage`.
- Define every locator as a `readonly` class field, using `getByRole` / `getByLabel` / `getByPlaceholder` / `getByTestId` first; CSS only as fallback; XPath as last resort.
- Use `test.extend` fixtures so specs read like `async ({ loginPage, inventoryPage }) => ...`.
- Import `test` and `expect` from the **site's** `pages.fixture.ts`, never from `@playwright/test` directly.
- Use web-first assertions: `await expect(locator).toHaveText('...')`.
- Use the per-project `baseURL`: page objects call `page.goto('/path')`, not full URLs.

**Don't**

- Don't put `expect(...)` inside page objects. Assertions belong in tests.
- Don't `new LoginPage(page)` inside a spec. Add it to the fixture.
- Don't use `page.waitForTimeout`. Ever.
- Don't pad a `*BasePage` with locators that aren't actually shared across the site.
- Don't add a method to `ElementHelper` unless Playwright cannot do it natively **and** the same need will show up in multiple page objects.

## ElementHelper escape hatches

The helper exists for cases where the native API doesn't fit. Always try the native option first:

| Helper | Try first |
|---|---|
| `jsClick(locator)` | `locator.click()`, then `{ force: true }` |
| `jsScrollIntoView(locator)` | `locator.scrollIntoViewIfNeeded()` |
| `getComputedStyle(locator, prop)` | `expect(locator).toHaveCSS(prop, value)` |
| `openSameTab(linkLocator)` | `context.waitForEvent('page')` |

## Files to touch when...

**Adding a page to an existing site** (e.g. SauceDemo cart page):

1. `src/websites/saucedemo/pages/CartPage.ts` — extends `SauceBasePage`.
2. `src/websites/saucedemo/fixtures/pages.fixture.ts` — add `cartPage` fixture.
3. `tests/saucedemo/<feature>.spec.ts` — destructure `cartPage` from the fixture.

**Adding a new website** (full recipe in [§2 of the guide](../../../docs/CODEBASE_GUIDE.md#2-adding-a-new-website)):

1. New project in `playwright.config.ts` with `testDir` + `baseURL`.
2. New path alias in `tsconfig.json`.
3. `src/websites/<id>/{pages,fixtures,data}/`.
4. `<Site>BasePage.ts` — only truly shared locators/actions.
5. `pages.fixture.ts` re-exporting `test` and `expect`.
6. `tests/<id>/<feature>.spec.ts` skeleton spec.
7. `test:<id>` script in `package.json`.

## When a user asks "add tests for site X"

1. Open the site with the Playwright MCP browser; inspect the markup of the screens involved.
2. Confirm the target flow with the user (single happy path? error path? auth required?).
3. Follow the "Adding a new website" recipe above.
4. Write the **minimum** to prove the flow end-to-end; defer additional helpers and pages until a second test needs them.
5. Run `npm run typecheck` then `npm test -- --project=<id>-chromium`.
