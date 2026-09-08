package com.demo.webdriveruniversity.tests;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

class ContactUsTest extends WduBaseTest {

  @Test
  void submitsContactForm() {
    homePage.goTo();
    homePage.openContactUs();

    contactUsPage.fillContactForm("Ada", "Lovelace", "ada.lovelace@example.com", "Great site!");
    contactUsPage.submit();

    wait.until(ExpectedConditions.visibilityOfElementLocated(contactUsPage.successHeader()));
  }
}
