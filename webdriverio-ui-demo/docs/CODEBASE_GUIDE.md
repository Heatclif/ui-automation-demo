# Codebase Guide

This is the source of truth for how this WebdriverIO repo is organised and how to write code in it. Read this first; the `wdio-pom` Cursor skill is a compressed view of these rules.

This is a multi-website WebdriverIO tech-demo — the TypeScript/WebdriverIO sibling of `playwright-ui-demo`. Today it tests **SauceDemo** and **WebDriverUniversity**, and the layout is designed so adding a third site is a recipe, not a redesign.

---

## 1. Layout

```
webdriverio-ui-demo/
├── wdio.shared.conf.ts                    # Options common to every site
├── wdio.saucedemo.conf.ts                 # SauceDemo config (baseUrl + specs), spreads shared
├── wdio.wdu.conf.ts                       # WebDriverUniversity config, same shape
├── tsconfig.json                          # Strict TS, path aliases
├── docs/CODEBASE_GUIDE.md                 # This file
├── .cursor/skills/wdio-pom/               # Cursor skill that points back here
├── src/
│   ├── helpers/
│   │   └── ElementHelper.ts               # Non-native, cross-site helpers
│   └── websites/
│       ├── saucedemo/
│       │   ├── pages/                     # Page objects (extend SauceBasePage), each a default-exported singleton
│       │   └── data/                      # Test data / domain types
│       └── webdriveruniversity/           # Same shape
└── test/specs/
    ├── saucedemo/                         # Specs for the saucedemo config
    └── webdriveruniversity/               # Specs for the wdu config
```

**Where things go:**

| Adding... | Goes to |
|---|---|
| A new page object for an existing site | `src/websites/<site>/pages/` |
| A locator that already exists, but with a different role | New field on the same page object |
| A new shared action across an entire site | The site's `*BasePage.ts` |
| A new "WebdriverIO doesn't natively do this" helper | `src/helpers/ElementHelper.ts` |
| A new test | `test/specs/<site>/<feature>.spec.ts` |
| Test data | `src/websites/<site>/data/` |

---

## 2. Why per-site config files instead of one

WebdriverIO doesn't have Playwright's "one config, many projects with their own baseURL" model out of the box. The equivalent here is one `wdio.<site>.conf.ts` per site, each spreading `wdio.shared.conf.ts` and overriding `baseUrl` + `specs`. Run them independently (`npm run test:saucedemo`, `npm run test:wdu`) or together (`npm test`, which runs both in sequence).

## 3. Adding a new website

1. Pick a short identifier (kebab-case). Use it as the folder name and the config/script suffix.
2. Create `wdio.<id>.conf.ts` spreading `shared` from `wdio.shared.conf.ts`, with its own `baseUrl` and `specs` glob.
3. Create `src/websites/<id>/` with `pages/` and (if needed) `data/`.
4. Add a path alias for the site in `tsconfig.json` (e.g. `"@<id>/*": ["src/websites/<id>/*"]`).
5. Write the site's `*BasePage.ts` — only put things that genuinely repeat across that site.
6. Create `test/specs/<id>/` and add at least one happy-path spec.
7. Add a `test:<id>` npm script.

---

## 4. Locator strategy

Order of preference, top to bottom:

1. `$('aria/<accessible name>')` — WebdriverIO's accessibility-name selector, closest thing to Playwright's `getByRole(..., { name })`
2. `$('[name="..."]')` / a real `<label>`'s `for` target — form fields
3. `$('tag=Exact text')` / `$('tag*=partial text')` — visible text content
4. `$('[data-test="..."]')` / `[data-testid]` — when a stable test id exists
5. `$('css-selector')` — fall back when none of the above fit
6. XPath (`$('//...')`) — last resort

**Rules:**

- Define one element handle per concept as a `get` accessor returning `$()`/`$$()`. **Never** assign the result to a field in the constructor — page objects are default-exported singletons created at module-import time, before a browser session exists, and `$()` throws if called before one is active. A getter defers the call until a test actually reads the property.
- Never store rendered values (text, attributes) as fields — they go stale.

---

## 5. Page Object Model

- Each page object **extends the site's BasePage** to inherit the `helper` and site-wide locators/actions.
- Every page object module's **only export is a singleton instance** (`export default new LoginPage()`), WebdriverIO's own recommended POM pattern — there's no per-test `page` handle to inject like in Playwright, since `browser`/`$`/`$$` are already global. This also makes "don't `new` a page object in a spec" structurally impossible to get wrong: the class itself isn't exported.
- Page objects expose **element getters** (public `get` accessors, not constructor-assigned fields) and **action methods** (`goto`, `login`, `submit`, etc.).
- Page objects **do not assert**. No `expect(...)` inside `src/`. Pages return state; tests assert on element handles.
- Page objects **do not catch errors**. Let WebdriverIO's timeouts surface failures.
- Page objects **do not import other page objects**. If you need to coordinate across pages, that's a test concern.
- Composition with `ElementHelper`: every BasePage instantiates one `helper` field for its subclasses to use. No inheritance from `ElementHelper`.

---

## 6. Per-site BasePage

Only put things that are **actually shared across that site**.

- `SauceBasePage` carries the burger menu, logout link, and shopping-cart badge — every authenticated page on SauceDemo has them.
- `WduBasePage` is small: just the header logo and the `openChallenge` action (since most WDU links open in a new tab). Padding it with a "global form input" or similar would be a lie.

If only two of ten pages share a locator, that's not a base-page concern — put it on the two pages directly.

---

## 7. ElementHelper

A single class with **four** focused methods, all under `src/helpers/ElementHelper.ts`:

| Method | When to reach for it | What to try first |
|---|---|---|
| `jsClick(el)` | An overlay or animation intercepts a real click | `el.click()` |
| `jsScrollIntoView(el, block?)` | Element ends up under a sticky header/footer | `el.scrollIntoView()` |
| `getComputedStyle(el, prop)` | A test needs to branch on a resolved CSS value | `el.getCSSProperty(prop)` — WebdriverIO already parses this natively; the helper is a thin wrapper kept only for call-site consistency |
| `openSameTab(linkEl)` | Site uses `target="_blank"` pervasively and you want to stay linear | `browser.getWindowHandles()` / `switchToWindow()` |

**Add new helpers sparingly.** The bar is: "WebdriverIO cannot do this natively, and we will need it in multiple page objects." Otherwise it belongs inline.

---

## 8. Assertions

Use `expect` from `@wdio/globals` (built on `expect-webdriverio`), which auto-retries against element matchers:

```ts
await expect(loginPage.errorMessage).toBeDisplayed();
await expect(inventoryPage.title).toHaveText('Products');
await expect(inventoryPage.inventoryItems).toBeElementsArrayOfSize({ gte: 1 });
expect(await browser.getUrl()).toContain('/inventory.html');
```

**Never** unwrap and then assert with a plain equality check on something that can still be loading — prefer a retrying matcher over `getText()` + manual compare.

---

## 9. No hard waits

`browser.pause(...)` is banned in tests and page objects. If you reach for it, the test will be flaky in CI within a month.

Use auto-waiting element actions, `expect(...).toBeDisplayed()`, or `browser.waitUntil(...)` with a real condition instead.

---

## 10. Test isolation

- Every test must run alone. No reliance on ordering.
- Use `beforeEach` for shared setup; don't share mutable state between tests in the same file.
- Tests in the same `describe` may share read-only data.

---

## 11. Naming

| What | Convention | Example |
|---|---|---|
| Page-object class | `PascalCase`, suffix `Page` | `InventoryPage` |
| Site BasePage | `<Site>BasePage` | `SauceBasePage`, `WduBasePage` |
| Element field | `camelCase`, suffix indicates kind | `usernameInput`, `loginButton`, `errorMessage` |
| Spec file | `kebab-case.spec.ts` | `contact-us.spec.ts` |
| Test data file | `camelCase` plural | `users.ts`, `products.ts` |
| Path alias | `@<site>/*` or `@helpers/*` | `@saucedemo/pages/LoginPage` |

---

## 12. Running and debugging

```bash
npm test                        # Both sites, sequentially
npm run test:saucedemo          # SauceDemo config only
npm run test:wdu                # WebDriverUniversity config only
npm run typecheck               # tsc --noEmit
```

For a single test:

```bash
npx wdio run ./wdio.saucedemo.conf.ts --spec ./test/specs/saucedemo/login.spec.ts
npx wdio run ./wdio.saucedemo.conf.ts --mochaOpts.grep "standard user logs in"
```

Screenshots are captured only on failure, to `errorShots/` (see `wdio.shared.conf.ts`'s `afterTest` hook).

---

## 13. CI

`.github/workflows/wdio.yml` runs `npm test` (both site configs) on push/PR to `main`/`master` and uploads failure screenshots as an artifact for 30 days.

---

## Next steps (not yet wired)

These are deferred until there's a real need:

- **A shared login session** for SauceDemo (WebdriverIO's equivalent of Playwright's `storageState`), so authenticated tests skip the login flow. Worth doing once there are more than two or three authenticated tests.
- **Allure reporting**, if the built-in `spec` reporter's console output stops being enough.
- **Visual regression** via a screenshot-diff service — pick one stable page first.
