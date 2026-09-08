---
name: wdio-pom
description: Authoring rules for this multi-website WebdriverIO POM framework (SauceDemo, WebDriverUniversity). Use when adding or editing tests under test/specs/, page objects under src/websites/, or helpers under src/helpers/, and whenever asked to add a new website, page, or spec.
---

# WebdriverIO POM (this repo)

The **source of truth** is [docs/CODEBASE_GUIDE.md](../../../docs/CODEBASE_GUIDE.md). Read it before authoring or modifying anything under `test/specs/`, `src/websites/`, or `src/helpers/`. The rules below are a compressed checklist.

## Do / don't

**Do**

- Put new page objects under `src/websites/<site>/pages/`, extending the site's `*BasePage`, and export only a singleton instance (`export default new FooPage()`).
- Define every element as a `get` accessor returning `$()`/`$$()` (never a constructor-assigned field — the singleton is created before a browser session exists, and `$()` requires one), preferring `aria/` accessible-name selectors, then form attributes, then text, then `data-test`/`data-testid`, then CSS; XPath as last resort.
- Import `expect`, `browser`, `$`, `$$` from `@wdio/globals` in both page objects and specs.
- Use retrying assertions: `await expect(locator).toHaveText('...')`, `toBeDisplayed()`, `toBeElementsArrayOfSize(...)`.
- Use the per-config `baseUrl`: page objects call `browser.url('/path')`, not full URLs.

**Don't**

- Don't put `expect(...)` inside page objects. Assertions belong in specs.
- Don't export the page-object class itself, only the singleton — there is no `page` handle to inject like Playwright, so specs must never `new` a page object.
- Don't use `browser.pause(...)`. Ever.
- Don't pad a `*BasePage` with locators that aren't actually shared across the site.
- Don't add a method to `ElementHelper` unless WebdriverIO cannot do it natively **and** the same need will show up in multiple page objects.

## ElementHelper escape hatches

The helper exists for cases where the native API doesn't fit. Always try the native option first:

| Helper | Try first |
|---|---|
| `jsClick(el)` | `el.click()` |
| `jsScrollIntoView(el)` | `el.scrollIntoView()` |
| `getComputedStyle(el, prop)` | `el.getCSSProperty(prop)` (already native — helper is a thin wrapper) |
| `openSameTab(linkEl)` | `browser.getWindowHandles()` / `switchToWindow()` |

## Files to touch when...

**Adding a page to an existing site** (e.g. SauceDemo cart page):

1. `src/websites/saucedemo/pages/CartPage.ts` — extends `SauceBasePage`, default-exports a singleton.
2. `test/specs/saucedemo/<feature>.spec.ts` — import the singleton directly.

**Adding a new website** (full recipe in [§3 of the guide](../../../docs/CODEBASE_GUIDE.md#3-adding-a-new-website)):

1. New `wdio.<id>.conf.ts` spreading `shared`, with its own `baseUrl` + `specs`.
2. New path alias in `tsconfig.json`.
3. `src/websites/<id>/{pages,data}/`.
4. `<Site>BasePage.ts` — only truly shared locators/actions.
5. `test/specs/<id>/<feature>.spec.ts` skeleton spec.
6. `test:<id>` script in `package.json`.

## When a user asks "add tests for site X"

1. Inspect the real markup of the screens involved (view source / devtools) — WebdriverIO has no browser-based MCP inspector built in, so `curl` + grep or a quick manual check stands in.
2. Confirm the target flow with the user (single happy path? error path? auth required?).
3. Follow the "Adding a new website" recipe above.
4. Write the **minimum** to prove the flow end-to-end; defer additional helpers and pages until a second test needs them.
5. Run `npm run typecheck` then `npx wdio run ./wdio.<id>.conf.ts`.
