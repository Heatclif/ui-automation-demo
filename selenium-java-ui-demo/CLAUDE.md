# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

**Read [docs/CODEBASE_GUIDE.md](docs/CODEBASE_GUIDE.md) first.** It is the source of truth for layout, conventions, and rules. This file is just orientation.

## What this repo is

A multi-website Selenium/Java tech demo — the Java sibling of `playwright-ui-demo` and `webdriverio-ui-demo`. The framework is structured so adding a new website is a recipe, not a redesign.

Currently covered sites:

- **SauceDemo** — `https://www.saucedemo.com`
- **WebDriverUniversity** — `https://webdriveruniversity.com`

## Commands

```bash
mvn test                                             # All tests, both sites
mvn test -Dtest=com.demo.saucedemo.tests.*           # SauceDemo only
mvn test -Dtest=com.demo.webdriveruniversity.tests.* # WebDriverUniversity only
mvn test -Dheadless=true                             # Headless Chrome (used in CI)
mvn test -Dtest=LoginTest#standardUserLogsIn         # Single test method
```

## Architecture (one-paragraph)

Maven project, JUnit 5 as the test runner, Chrome-only via Selenium Manager (built into `selenium-java` — no manual driver downloads or a separate driver-management dependency). `com.demo.base.BaseTest` owns the `WebDriver`/`WebDriverWait` lifecycle (`@BeforeEach`/`@AfterEach`) and is extended by a per-site `<Site>BaseTest` that wires up that site's page objects. Page objects live under `src/test/java/com/demo/<site>/pages/` (test-support code, not production code) and extend a per-site `<Site>BasePage` for shared locators/actions. `com.demo.base.Config` reads `src/test/resources/config.properties` for per-site base URLs, since Selenium has no built-in per-project baseURL concept. Cross-site, non-native operations live as four methods on `com.demo.helpers.ElementHelper`.

## Where to go next

- Conventions, locator strategy, POM rules, naming: [docs/CODEBASE_GUIDE.md](docs/CODEBASE_GUIDE.md)
- Short do/don't checklist + "what files to touch" recipes: [.cursor/skills/selenium-pom/SKILL.md](.cursor/skills/selenium-pom/SKILL.md)

## CI

`.github/workflows/selenium.yml` runs `mvn test -Dheadless=true` on push/PR to `main`/`master` and uploads the Surefire reports (and any failure screenshots) as an artifact for 30 days.
