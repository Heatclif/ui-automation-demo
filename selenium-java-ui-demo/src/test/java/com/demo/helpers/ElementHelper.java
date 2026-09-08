package com.demo.helpers;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * A small set of escape hatches for things Selenium's native API doesn't cover, or doesn't cover
 * well enough for every page object to reimplement. Mirrors the sibling Playwright/WebdriverIO
 * repos' ElementHelper: four methods, added only because the native option falls short AND
 * multiple page objects need it. Always try the native option first — see the table in
 * docs/CODEBASE_GUIDE.md.
 */
public class ElementHelper {

  private final WebDriver driver;

  public ElementHelper(WebDriver driver) {
    this.driver = driver;
  }

  /** Bypasses Selenium's actionability checks when an overlay/animation intercepts a real click. */
  public void jsClick(WebElement element) {
    ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
  }

  /**
   * Selenium has no native scrollIntoView on WebElement (unlike Playwright/WebdriverIO). Centers
   * the element in the viewport by default, useful when a sticky header/footer would otherwise
   * cover it.
   */
  public void jsScrollIntoView(WebElement element) {
    jsScrollIntoView(element, "center");
  }

  public void jsScrollIntoView(WebElement element, String block) {
    ((JavascriptExecutor) driver)
        .executeScript("arguments[0].scrollIntoView({block: arguments[1]});", element, block);
  }

  /**
   * WebElement#getCssValue already returns the browser-resolved value, so this is a thin wrapper
   * kept only for call-site consistency with the other site helpers.
   */
  public String getComputedStyle(WebElement element, String property) {
    return element.getCssValue(property);
  }

  /**
   * Strips {@code target="_blank"} before clicking so a link opens in the same tab/window,
   * avoiding window-handle juggling for sites that use target="_blank" pervasively.
   */
  public void openSameTab(WebElement link) {
    ((JavascriptExecutor) driver).executeScript("arguments[0].removeAttribute('target');", link);
    link.click();
  }
}
