# Codebase Guide

This is the source of truth for how this Playwright repo is organised and how to write code in it. Read this first; the `playwright-pom` Cursor skill is a compressed view of these rules.

This is a multi-website Playwright tech-demo. Today it tests **SauceDemo** and **WebDriverUniversity**, and the layout is designed so adding a third site is a recipe, not a redesign.

---

## 1. Layout

```
playwright-ui-demo/
├── playwright.config.ts                   # One project per site (chromium-only by default)
├── tsconfig.json                          # Strict TS, path aliases
├── docs/CODEBASE_GUIDE.md                 # This file
├── .cursor/skills/playwright-pom/         # Cursor skill that points back here
├── src/
│   ├── helpers/
│   │   └── ElementHelper.ts               # Non-native, cross-site helpers
│   └── websites/
│       ├── saucedemo/
│       │   ├── pages/                     # Page objects (extend SauceBasePage)
│       │   ├── fixtures/pages.fixture.ts  # test.extend wiring up page objects
│       │   └── data/                      # Test data / domain types
│       └── webdriveruniversity/           # Same shape
└── tests/
    ├── saucedemo/                         # Specs for SauceDemo project
    └── webdriveruniversity/               # Specs for WDU project
```

**Where things go:**

| Adding... | Goes to |
|---|---|
| A new page object for an existing site | `src/websites/<site>/pages/` |
| A locator that already exists, but with a different role | New field on the same page object |
| A new shared action across an entire site | The site's `*BasePage.ts` |
| A new "Playwright doesn't natively do this" helper | `src/helpers/ElementHelper.ts` |
| A new test | `tests/<site>/<feature>.spec.ts` |
| Test data | `src/websites/<site>/data/` |

---

## 2. Adding a new website

1. Pick a short identifier (kebab-case). Use it as the folder name and the project name suffix.
2. Add a project to `playwright.config.ts` with its own `testDir`, `baseURL`, and any site-specific `use` options (e.g. `testIdAttribute`).
3. Create `src/websites/<id>/` with `pages/`, `fixtures/`, and (if needed) `data/`.
4. Add a path alias for the site in `tsconfig.json` (e.g. `"@<id>/*": ["src/websites/<id>/*"]`).
5. Write the site's `*BasePage.ts` — only put things that genuinely repeat across that site.
6. Write `pages.fixture.ts` exporting `test` and `expect`.
7. Create `tests/<id>/` and add at least one happy-path spec.
8. Add a `test:<id>` npm script.

---

## 3. Locator strategy

Order of preference, top to bottom:

1. `page.getByRole(role, { name })` — most resilient, mirrors how users find elements
2. `page.getByLabel(text)` — form fields with `<label>`
3. `page.getByPlaceholder(text)` — form fields without labels
4. `page.getByText(text)` — visible text content
5. `page.getByTestId(id)` — when a stable test id exists (set `testIdAttribute` in the project's `use` to match the site's convention)
6. `page.locator('css-selector')` — fall back when none of the semantic queries fit
7. XPath — last resort

**Rules:**

- Define one Locator per concept as a `readonly` class field. Don't build locators inside action methods.
- Locators are lazy; assigning them in the constructor is free.
- Never store rendered values (text, attributes) as fields — they go stale.

---

## 4. Page Object Model

- Each page object **extends the site's BasePage** to inherit `page`, the `helper`, and site-wide locators/actions.
- Page objects expose **Locator fields** (public, `readonly`) and **action methods** (`goto`, `login`, `submit`, etc.).
- Page objects **do not assert**. No `expect(...)` inside `src/`. Pages return state; tests assert on Locators.
- Page objects **do not catch errors**. Let Playwright's timeouts surface failures.
- Page objects **do not call other page objects**. If you need to coordinate across pages, that's a test concern (compose them via fixtures).
- Composition with `ElementHelper`: every BasePage instantiates one `helper` field for its subclasses to use. No inheritance from `ElementHelper`.

---

## 5. Per-site BasePage

Only put things that are **actually shared across that site**.

For example:

- `SauceBasePage` carries the burger menu, logout link, and shopping-cart badge — every authenticated page on SauceDemo has them.
- `WduBasePage` is small: just the header logo and the `openChallenge` action (since most WDU links open in a new tab). Padding it with a "global form input" or similar would be a lie.

If only two of ten pages share a locator, that's not a base-page concern — put it on the two pages directly, or extract a small mixin.

---

## 6. ElementHelper

A single class with **four** focused methods, all under `src/helpers/ElementHelper.ts`:

| Method | When to reach for it | What to try first |
|---|---|---|
| `jsClick(locator)` | An overlay or animation intercepts a real click | `locator.click()`, then `{ force: true }` |
| `jsScrollIntoView(locator, block?)` | Element ends up under a sticky header/footer | `locator.scrollIntoViewIfNeeded()` |
| `getComputedStyle(locator, prop)` | A test needs to branch on a resolved CSS value | `expect(locator).toHaveCSS(prop, value)` |
| `openSameTab(linkLocator)` | Site uses `target="_blank"` pervasively and you want to stay linear | `context.waitForEvent('page')` |

**Add new helpers sparingly.** The bar is: "Playwright cannot do this natively, and we will need it in multiple page objects." Otherwise it belongs inline.

---

## 7. Fixtures

Every site has a `pages.fixture.ts` that re-exports `test` and `expect`:

```ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '@saucedemo/pages/LoginPage';

export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
});
export { expect };
```

**Rules:**

- Tests import `test` and `expect` **only** from their site's fixture, never from `@playwright/test`. This is what makes `async ({ loginPage }) =>` type-check.
- Don't instantiate page objects in specs (`new LoginPage(page)`). If you need it, add it to the fixture.
- Don't reach for raw `page` in tests except for genuine page-level assertions (`expect(page).toHaveURL(...)`).

---

## 8. Web-first assertions

Use the locator-based `expect`, which auto-retries:

```ts
await expect(loginPage.errorMessage).toBeVisible();
await expect(inventoryPage.title).toHaveText('Products');
await expect(page).toHaveURL(/inventory/);
```

**Never** unwrap and then assert:

```ts
// DON'T
expect(await loginPage.errorMessage.textContent()).toBe('...'); // no auto-retry
```

---

## 9. No hard waits

`page.waitForTimeout(...)` is banned in tests and page objects. If you reach for it, the test will be flaky in CI within a month.

Use auto-waiting locators, `expect(...).toBeVisible()`, `page.waitForURL(...)`, or `page.waitForResponse(...)` instead.

---

## 10. Test isolation

- Every test must run alone. No reliance on ordering.
- Use `test.beforeEach` for shared setup; don't share mutable state between tests in the same file.
- Tests in the same `describe` may share read-only data.

---

## 11. Naming

| What | Convention | Example |
|---|---|---|
| Page-object class | `PascalCase`, suffix `Page` | `InventoryPage` |
| Site BasePage | `<Site>BasePage` | `SauceBasePage`, `WduBasePage` |
| Locator field | `camelCase`, suffix indicates kind | `usernameInput`, `loginButton`, `errorMessage` |
| Spec file | `kebab-case.spec.ts` | `contact-us.spec.ts` |
| Test data file | `camelCase` plural | `users.ts`, `products.ts` |
| Path alias | `@<site>/*` or `@helpers/*` | `@saucedemo/pages/LoginPage` |

---

## 12. Running and debugging

```bash
npm test                        # All projects
npm run test:saucedemo          # SauceDemo project only
npm run test:wdu                # WebDriverUniversity project only
npm run test:ui                 # Interactive UI mode
npm run test:headed             # Headed browsers
npm run test:report             # Open the last HTML report
npm run typecheck               # tsc --noEmit
```

For a single test:

```bash
npx playwright test tests/saucedemo/login.spec.ts
npx playwright test -g "standard user logs in"
npx playwright test --debug      # Step through with the inspector
```

Traces, screenshots, and videos are captured only on failure (see `playwright.config.ts`).

---

## 13. CI

The GitHub Actions workflow runs `npx playwright test`, which executes every project in `playwright.config.ts`. To enable cross-browser, uncomment the firefox/webkit projects.

---

## Next steps (not yet wired)

These are deferred until there's a real need:

- **`storageState` + setup project** for SauceDemo, so authenticated tests skip the login flow. Worth doing once there are more than two or three authenticated tests.
- **Dialog / table / DOM-stability helpers.** Add to `ElementHelper` the first time a second test needs them.
- **Visual regression** via `expect(page).toHaveScreenshot()` — pick one stable page first.
