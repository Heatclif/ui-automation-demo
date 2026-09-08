package com.demo.base;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

/**
 * Captures a screenshot only on failure, to {@code errorShots/}.
 * Parity with the Playwright repo's screenshot-only-on-failure config.
 */
public class ScreenshotOnFailureExtension implements TestWatcher {

  @Override
  public void testFailed(ExtensionContext context, Throwable cause) {
    WebDriver driver = BaseTest.currentDriver();
    if (!(driver instanceof TakesScreenshot)) {
      return;
    }
    try {
      Path dir = Path.of("errorShots");
      Files.createDirectories(dir);
      File shot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
      Files.copy(shot.toPath(), dir.resolve(context.getRequiredTestMethod().getName() + ".png"));
    } catch (IOException e) {
      // ponytail: best-effort diagnostics only — never fail a test over a screenshot.
    }
  }
}
