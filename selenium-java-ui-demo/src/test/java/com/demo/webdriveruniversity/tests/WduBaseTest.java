package com.demo.webdriveruniversity.tests;

import com.demo.base.BaseTest;
import com.demo.webdriveruniversity.pages.ContactUsPage;
import com.demo.webdriveruniversity.pages.HomePage;
import org.junit.jupiter.api.BeforeEach;

abstract class WduBaseTest extends BaseTest {

  protected HomePage homePage;
  protected ContactUsPage contactUsPage;

  @BeforeEach
  void setUpPages() {
    homePage = new HomePage(driver, wait);
    contactUsPage = new ContactUsPage(driver, wait);
  }
}
