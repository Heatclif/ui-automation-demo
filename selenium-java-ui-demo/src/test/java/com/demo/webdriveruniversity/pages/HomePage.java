package com.demo.webdriveruniversity.pages;

import com.demo.base.Config;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

public class HomePage extends WduBasePage {

  private final By heading = By.xpath("//h1[contains(., 'Practise')]");
  private final By contactUsCard = By.id("contact-us");

  public HomePage(WebDriver driver, WebDriverWait wait) {
    super(driver, wait);
  }

  public void goTo() {
    driver.get(Config.get("wdu.baseUrl") + "/index.html");
  }

  public By heading() {
    return heading;
  }

  public void openContactUs() {
    openChallenge(driver.findElement(contactUsCard));
  }
}
