package com.demo.saucedemo.tests;

import com.demo.base.BaseTest;
import com.demo.saucedemo.pages.InventoryPage;
import com.demo.saucedemo.pages.LoginPage;
import org.junit.jupiter.api.BeforeEach;

/** Wires up SauceDemo page objects per test, same lifecycle as the shared BaseTest. */
abstract class SauceDemoBaseTest extends BaseTest {

  protected LoginPage loginPage;
  protected InventoryPage inventoryPage;

  @BeforeEach
  void setUpPages() {
    loginPage = new LoginPage(driver, wait);
    inventoryPage = new InventoryPage(driver, wait);
  }
}
