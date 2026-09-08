# Codebase Guide

This is the source of truth for how this Selenium repo is organised and how to write code in it. Read this first; the `selenium-pom` Cursor skill is a compressed view of these rules.

This is a multi-website Selenium/Java tech-demo — the Java sibling of `playwright-ui-demo` and `webdriverio-ui-demo`. Today it tests **SauceDemo** and **WebDriverUniversity**, and the layout is designed so adding a third site is a recipe, not a redesign.

---

## 1. Layout

```
selenium-java-ui-demo/
├── pom.xml                                # Maven build: Selenium, JUnit 5, compiler/surefire plugins
├── docs/CODEBASE_GUIDE.md                 # This file
├── .cursor/skills/selenium-pom/           # Cursor skill that points back here
└── src/test/
    ├── resources/
    │   └── config.properties              # Per-site baseUrl (Selenium has no built-in equivalent)
    └── java/com/demo/
        ├── base/                          # BaseTest (driver lifecycle), Config, screenshot-on-failure
        ├── helpers/
        │   └── ElementHelper.java         # Non-native, cross-site helpers
        ├── saucedemo/
        │   ├── pages/                     # Page objects, extend SauceBasePage
        │   ├── data/                      # Test data / domain types
        │   └── tests/                     # JUnit 5 test classes
        └── webdriveruniversity/           # Same shape (pages/, tests/)
```

Page objects and test data live under `src/test/java`, not `src/main/java` — they are test-support code, a deliberate and common Maven/Selenium convention.

**Where things go:**

| Adding... | Goes to |
|---|---|
| A new page object for an existing site | `.../<site>/pages/` |
| A locator that already exists, but with a different role | New field on the same page object |
| A new shared action across an entire site | The site's `*BasePage.java` |
| A new "Selenium doesn't natively do this" helper | `com/demo/helpers/ElementHelper.java` |
| A new test | `.../<site>/tests/<Feature>Test.java` |
| Test data | `.../<site>/data/` |

---

## 2. Why `config.properties` instead of per-project baseURL

Selenium has no equivalent of Playwright's "one config, many projects with their own baseURL". `com.demo.base.Config` reads `src/test/resources/config.properties`, which holds one `<site>.baseUrl` entry per site. Page objects call `Config.get("saucedemo.baseUrl")` (or `"wdu.baseUrl"`) inside their own `goTo()` method rather than hardcoding a host.

## 3. Adding a new website

1. Pick a short identifier (e.g. `newsite`).
2. Add `<newsite>.baseUrl=...` to `config.properties`.
3. Create `com/demo/newsite/{pages,data,tests}/`.
4. Write `NewsiteBasePage.java` — only put things that genuinely repeat across that site (driver/wait fields, an `ElementHelper`, truly shared locators).
5. Write page objects extending it, plus a `NewsiteBaseTest` (extends the shared `BaseTest`, wires up that site's page objects in a `@BeforeEach`).
6. Add at least one happy-path `@Test`.

---

## 4. Locator strategy

Order of preference, top to bottom:

1. `By.id(...)` / a real `<label>`'s target — the most stable option when present
2. `By.cssSelector("[name='...']")` — form fields
3. `By.cssSelector("[data-test='...']")` / `[data-testid]` — when a stable test id exists
4. `By.cssSelector(...)` — general CSS
5. `By.xpath(...)` — text content or structural matches Selenium's CSS engine can't express; last resort

Selenium has no built-in accessible-role query like Playwright's `getByRole` or WebdriverIO's `aria/`, so semantic-first here means "prefer `id`/`name`/test-id attributes over incidental CSS classes", not a literal a11y query.

**Rules:**

- Store one `By` locator per concept as a `private final By` field, assigned in the constructor. `By` objects don't touch the DOM until used, so this is safe — unlike `WebElement`.
- **Never** store a found `WebElement` as a field. Elements go stale after any navigation or DOM change; always `driver.findElement(locator)` inside the action/assertion method that needs it, at call time.

---

## 5. Page Object Model

- Each page object **extends the site's BasePage** to inherit `driver`, `wait`, `helper`, and site-wide locators/actions.
- Page objects expose **locators via getter methods** (`public By title()`) for anything a test needs to assert on, and **action methods** (`goTo`, `login`, `submit`, ...).
- Page objects **do not assert**. No `Assertions.*` inside page-object classes — assertions live in test classes.
- Page objects **do not catch errors**. Let `WebDriverWait` timeouts and Selenium's own exceptions surface failures.
- Page objects **do not import other page objects**. Coordinating across pages is a test concern.
- Composition with `ElementHelper`: every BasePage instantiates one `helper` field for its subclasses. No inheritance from `ElementHelper`.
- Page objects take `WebDriver` and `WebDriverWait` via constructor injection (no `page` handle to inject like Playwright, no singleton pattern like WebdriverIO — Java/Selenium's idiom is a plain object per test).

---

## 6. Per-site BasePage

Only put things that are **actually shared across that site**.

- `SauceBasePage` carries the burger menu, logout link, and shopping-cart badge — every authenticated page on SauceDemo has them.
- `WduBasePage` is small: just the header logo locator and the `openChallenge` action (most WDU links open in a new tab). Padding it with a "global form input" or similar would be a lie.

If only two of ten pages share a locator, that's not a base-page concern — put it on the two pages directly.

---

## 7. ElementHelper

A single class with **four** focused methods, `com/demo/helpers/ElementHelper.java`:

| Method | When to reach for it | What to try first |
|---|---|---|
| `jsClick(el)` | An overlay or animation intercepts a real click | `element.click()` |
| `jsScrollIntoView(el, block?)` | Element ends up under a sticky header/footer | Nothing — Selenium's `WebElement` has no native scrollIntoView |
| `getComputedStyle(el, prop)` | A test needs to branch on a resolved CSS value | `element.getCssValue(prop)` — already native; the helper is a thin wrapper kept only for call-site consistency |
| `openSameTab(link)` | Site uses `target="_blank"` pervasively and you want to stay linear | Window-handle switching (`driver.getWindowHandles()` / `driver.switchTo().window(...)`) |

**Add new helpers sparingly.** The bar is: "Selenium cannot do this natively, and we will need it in multiple page objects." Otherwise it belongs inline.

---

## 8. Assertions

Plain JUnit 5 `Assertions`, paired with an explicit `WebDriverWait` as the retry mechanism (Selenium has no auto-retrying assertion library built in, unlike Playwright's `expect(locator)` or `expect-webdriverio`):

```java
wait.until(ExpectedConditions.urlContains("/inventory.html"));
assertTrue(driver.getCurrentUrl().endsWith("/inventory.html"));

var titleEl = wait.until(ExpectedConditions.visibilityOfElementLocated(inventoryPage.title()));
assertEquals("Products", titleEl.getText());
```

**Never** call `driver.findElement(...).getText()` directly on something that might still be loading — wait for the condition first (`visibilityOfElementLocated`, `elementToBeClickable`, ...), then assert on the result.

---

## 9. No hard waits

`Thread.sleep(...)` is banned in tests and page objects. If you reach for it, the test will be flaky in CI within a month.

Use `WebDriverWait` + `ExpectedConditions` (or a custom lambda condition, see `WduBasePage.openChallenge`) instead.

---

## 10. Test isolation

- Every test must run alone. No reliance on ordering.
- `BaseTest` creates a fresh `WebDriver` per test in `@BeforeEach` and quits it in `@AfterEach` — no shared browser session across tests.
- Tests in the same class may share read-only data (e.g. `SauceUser.STANDARD_USER`), never mutable state.

---

## 11. Naming

| What | Convention | Example |
|---|---|---|
| Page-object class | `PascalCase`, suffix `Page` | `InventoryPage` |
| Site BasePage | `<Site>BasePage` | `SauceBasePage`, `WduBasePage` |
| Locator field | `camelCase`, suffix indicates kind | `usernameInput`, `loginButton`, `errorMessage` |
| Test class | `PascalCase`, suffix `Test` | `LoginTest`, `ContactUsTest` |
| Test data class | Domain noun, `record` where possible | `SauceUser` |
| Package | `com.demo.<site>.{pages,data,tests}` | `com.demo.saucedemo.pages` |

---

## 12. Running and debugging

```bash
mvn test                                             # Both sites
mvn test -Dtest=com.demo.saucedemo.tests.*           # SauceDemo only
mvn test -Dtest=com.demo.webdriveruniversity.tests.* # WebDriverUniversity only
mvn test -Dheadless=true                             # Headless Chrome (used in CI)
mvn test -Dtest=LoginTest#standardUserLogsIn         # Single test method
```

Screenshots are captured only on failure, to `errorShots/` (see `ScreenshotOnFailureExtension`).

---

## 13. CI

`.github/workflows/selenium.yml` runs `mvn test -Dheadless=true` on push/PR to `main`/`master` and uploads the Surefire reports + any `errorShots/` as an artifact for 30 days.

---

## Next steps (not yet wired)

These are deferred until there's a real need:

- **A shared login session** for SauceDemo (e.g. injecting cookies before navigation), so authenticated tests skip the login flow. Worth doing once there are more than two or three authenticated tests.
- **Allure reporting**, if Surefire's default text/XML reports stop being enough.
- **Visual regression** via a screenshot-diff library — pick one stable page first.
- **Parallel test execution** via JUnit 5's parallel execution config, once the suite is large enough to benefit.
