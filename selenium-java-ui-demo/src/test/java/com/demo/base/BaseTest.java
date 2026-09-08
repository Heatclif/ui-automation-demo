package com.demo.base;

import java.time.Duration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Chrome-only driver lifecycle, shared by every site's tests. Parity with the Playwright repo's
 * chromium-only default (firefox/edge can be added the same way, see docs/CODEBASE_GUIDE.md).
 *
 * Selenium Manager (built into selenium-java since 4.6) resolves the matching chromedriver
 * binary automatically — no separate driver-management dependency needed.
 */
@ExtendWith(ScreenshotOnFailureExtension.class)
public abstract class BaseTest {

  private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

  protected WebDriver driver;
  protected WebDriverWait wait;

  @BeforeEach
  void setUpDriver() {
    ChromeOptions options = new ChromeOptions();
    if (Boolean.parseBoolean(System.getProperty("headless", "false"))) {
      options.addArguments("--headless=new");
    }
    driver = new ChromeDriver(options);
    driver.manage().window().maximize();
    wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    DRIVER.set(driver);
  }

  @AfterEach
  void tearDownDriver() {
    if (driver != null) {
      driver.quit();
    }
    DRIVER.remove();
  }

  static WebDriver currentDriver() {
    return DRIVER.get();
  }
}
