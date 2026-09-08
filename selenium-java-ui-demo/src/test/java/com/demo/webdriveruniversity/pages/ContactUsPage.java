package com.demo.webdriveruniversity.pages;

import com.demo.base.Config;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

public class ContactUsPage extends WduBasePage {

  private final By firstNameInput = By.cssSelector("input[name='first_name']");
  private final By lastNameInput = By.cssSelector("input[name='last_name']");
  private final By emailInput = By.cssSelector("input[name='email']");
  private final By commentInput = By.cssSelector("textarea[name='message']");
  private final By submitButton = By.cssSelector("input.contact_button[type='submit']");
  private final By resetButton = By.cssSelector("input.contact_button[type='reset']");

  // Text-only selector, robust to whatever element wraps the message (mirrors the "text content"
  // rung in the locator strategy — the exact wrapping tag was never confirmed against live markup).
  private final By successHeader = By.xpath("//*[contains(text(), 'Thank You for your Message')]");

  public ContactUsPage(WebDriver driver, WebDriverWait wait) {
    super(driver, wait);
  }

  public void goTo() {
    driver.get(Config.get("wdu.baseUrl") + "/Contact-Us/contactus.html");
  }

  public void fillContactForm(String firstName, String lastName, String email, String comment) {
    driver.findElement(firstNameInput).sendKeys(firstName);
    driver.findElement(lastNameInput).sendKeys(lastName);
    driver.findElement(emailInput).sendKeys(email);
    driver.findElement(commentInput).sendKeys(comment);
  }

  public void submit() {
    driver.findElement(submitButton).click();
  }

  public By successHeader() {
    return successHeader;
  }
}
