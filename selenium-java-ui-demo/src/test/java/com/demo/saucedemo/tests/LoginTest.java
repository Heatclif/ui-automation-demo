package com.demo.saucedemo.tests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.demo.saucedemo.data.SauceUser;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

class LoginTest extends SauceDemoBaseTest {

  @Test
  void standardUserLogsIn() {
    loginPage.goTo();
    loginPage.login(SauceUser.STANDARD_USER);

    wait.until(ExpectedConditions.urlContains("/inventory.html"));
    assertTrue(driver.getCurrentUrl().endsWith("/inventory.html"));

    var titleEl = wait.until(ExpectedConditions.visibilityOfElementLocated(inventoryPage.title()));
    assertEquals("Products", titleEl.getText());

    assertFalse(inventoryPage.inventoryItems().isEmpty());
  }
}
