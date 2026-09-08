package com.demo.saucedemo.pages;

import com.demo.helpers.ElementHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Base for every authenticated SauceDemo page: the burger menu, logout link, and cart badge are
 * present on all of them.
 *
 * Locators are {@code By} fields, not found elements — Selenium's {@code WebElement} goes stale
 * after any navigation/DOM change, so every action re-finds via {@code driver.findElement(by)}
 * at call time.
 */
public abstract class SauceBasePage {

  protected final WebDriver driver;
  protected final WebDriverWait wait;
  protected final ElementHelper helper;

  protected final By burgerMenuButton = By.id("react-burger-menu-btn");
  protected final By logoutLink = By.cssSelector("[data-test='logout-sidebar-link']");
  protected final By shoppingCartLink = By.cssSelector("[data-test='shopping-cart-link']");
  protected final By shoppingCartBadge = By.cssSelector("[data-test='shopping-cart-badge']");

  protected SauceBasePage(WebDriver driver, WebDriverWait wait) {
    this.driver = driver;
    this.wait = wait;
    this.helper = new ElementHelper(driver);
  }

  public void openMenu() {
    wait.until(ExpectedConditions.elementToBeClickable(burgerMenuButton)).click();
  }

  public void logout() {
    openMenu();
    wait.until(ExpectedConditions.elementToBeClickable(logoutLink)).click();
  }

  public void openCart() {
    driver.findElement(shoppingCartLink).click();
  }

  /** Returns 0 when the badge is absent (empty cart), instead of throwing. */
  public int cartBadgeCount() {
    var badges = driver.findElements(shoppingCartBadge);
    return badges.isEmpty() ? 0 : Integer.parseInt(badges.get(0).getText());
  }
}
