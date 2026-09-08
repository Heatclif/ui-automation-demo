---
name: selenium-pom
description: Authoring rules for this multi-website Selenium/Java POM framework (SauceDemo, WebDriverUniversity). Use when adding or editing test classes under src/test/java/com/demo/<site>/tests/, page objects under src/test/java/com/demo/<site>/pages/, or helpers under src/test/java/com/demo/helpers/, and whenever asked to add a new website, page, or test.
---

# Selenium POM (this repo)

The **source of truth** is [docs/CODEBASE_GUIDE.md](../../../docs/CODEBASE_GUIDE.md). Read it before authoring or modifying anything under `com/demo/<site>/`. The rules below are a compressed checklist.

## Do / don't

**Do**

- Put new page objects under `com/demo/<site>/pages/`, extending the site's `<Site>BasePage`, constructor-injected with `WebDriver` + `WebDriverWait`.
- Define every element as a `private final By` field assigned in the constructor, exposed to tests via a getter method (`public By title()`) when a test needs to wait/assert on it. Never store a found `WebElement` as a field — always `driver.findElement(locator)` at call time.
- Prefer `By.id`, then `By.cssSelector("[name=...]")`, then `[data-test]`/`[data-testid]` CSS, then general CSS, then XPath as a last resort.
- Wait with `WebDriverWait` + `ExpectedConditions` before asserting: `wait.until(ExpectedConditions.visibilityOfElementLocated(locator))`.
- Use `Config.get("<site>.baseUrl")` inside a page object's `goTo()` — never hardcode a host.

**Don't**

- Don't put `Assertions.*` calls inside page objects. Assertions belong in test classes.
- Don't use `Thread.sleep(...)`. Ever.
- Don't pad a `<Site>BasePage` with locators that aren't actually shared across the site.
- Don't add a method to `ElementHelper` unless Selenium cannot do it natively **and** the same need will show up in multiple page objects.
- Don't add `webdrivermanager` or similar — Selenium Manager (built into `selenium-java` 4.6+) already resolves driver binaries.

## ElementHelper escape hatches

The helper exists for cases where the native API doesn't fit. Always try the native option first:

| Helper | Try first |
|---|---|
| `jsClick(el)` | `element.click()` |
| `jsScrollIntoView(el)` | Nothing native — `WebElement` has no scrollIntoView |
| `getComputedStyle(el, prop)` | `element.getCssValue(prop)` (already native — helper is a thin wrapper) |
| `openSameTab(link)` | `driver.getWindowHandles()` / `driver.switchTo().window(...)` |

## Files to touch when...

**Adding a page to an existing site** (e.g. SauceDemo cart page):

1. `com/demo/saucedemo/pages/CartPage.java` — extends `SauceBasePage`, constructor takes `(WebDriver, WebDriverWait)`.
2. `com/demo/saucedemo/tests/<Feature>Test.java` — extend `SauceDemoBaseTest`, instantiate via the shared `@BeforeEach` wiring (add the new page object there too).

**Adding a new website** (full recipe in [§3 of the guide](../../../docs/CODEBASE_GUIDE.md#3-adding-a-new-website)):

1. Add `<id>.baseUrl=...` to `src/test/resources/config.properties`.
2. `com/demo/<id>/{pages,data,tests}/` packages.
3. `<Id>BasePage.java` — only truly shared locators/actions.
4. `<Id>BaseTest.java` extending `BaseTest`, wiring that site's page objects.
5. A first `@Test` proving the happy path.

## When a user asks "add tests for site X"

1. Inspect the real markup of the screens involved (view source / devtools) — `curl` + grep or a quick manual check stands in when no browser inspector is available.
2. Confirm the target flow with the user (single happy path? error path? auth required?).
3. Follow the "Adding a new website" recipe above.
4. Write the **minimum** to prove the flow end-to-end; defer additional helpers and pages until a second test needs them.
5. Run `mvn test -Dtest=<Id>*Test`.
