package com.demo.saucedemo.pages;

import com.demo.base.Config;
import com.demo.saucedemo.data.SauceUser;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginPage extends SauceBasePage {

  private final By usernameInput = By.cssSelector("[data-test='username']");
  private final By passwordInput = By.cssSelector("[data-test='password']");
  private final By loginButton = By.cssSelector("[data-test='login-button']");
  private final By errorMessage = By.cssSelector("[data-test='error']");

  public LoginPage(WebDriver driver, WebDriverWait wait) {
    super(driver, wait);
  }

  public void goTo() {
    driver.get(Config.get("saucedemo.baseUrl") + "/");
  }

  public void login(SauceUser user) {
    driver.findElement(usernameInput).sendKeys(user.username());
    driver.findElement(passwordInput).sendKeys(user.password());
    driver.findElement(loginButton).click();
  }

  public By errorMessageLocator() {
    return errorMessage;
  }
}
