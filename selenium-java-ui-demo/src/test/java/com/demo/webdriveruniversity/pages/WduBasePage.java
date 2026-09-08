package com.demo.webdriveruniversity.pages;

import com.demo.helpers.ElementHelper;
import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Deliberately thin: WDU challenges share very little markup beyond the top nav. Exists for the
 * helper plumbing and {@code openChallenge}, which navigates from the home page into a challenge
 * in the same tab (every challenge link is {@code target="_blank"}).
 */
public abstract class WduBasePage {

  protected final WebDriver driver;
  protected final WebDriverWait wait;
  protected final ElementHelper helper;

  protected final By headerLogo = By.id("nav-title");

  protected WduBasePage(WebDriver driver, WebDriverWait wait) {
    this.driver = driver;
    this.wait = wait;
    this.helper = new ElementHelper(driver);
  }

  /**
   * Strips target="_blank" before clicking so the challenge loads in-place, then waits for the
   * new document to be ready — the explicit sync point, without it follow-up actions can race
   * the in-flight navigation.
   */
  protected void openChallenge(WebElement link) {
    helper.openSameTab(link);
    // ponytail: a fresh WebDriverWait here, not the shared `wait` — FluentWait#withTimeout
    // mutates the instance it's called on, so reusing `wait` would permanently change its
    // timeout for every later call in the test.
    new WebDriverWait(driver, Duration.ofSeconds(10))
        .until(d -> "complete".equals(((JavascriptExecutor) d).executeScript("return document.readyState")));
  }
}
