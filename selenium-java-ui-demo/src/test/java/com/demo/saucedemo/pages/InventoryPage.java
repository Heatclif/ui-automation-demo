package com.demo.saucedemo.pages;

import java.util.List;
import java.util.NoSuchElementException;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

public class InventoryPage extends SauceBasePage {

  private final By title = By.cssSelector("[data-test='title']");
  private final By inventoryItems = By.cssSelector("[data-test='inventory-item']");

  public InventoryPage(WebDriver driver, WebDriverWait wait) {
    super(driver, wait);
  }

  public By title() {
    return title;
  }

  public List<WebElement> inventoryItems() {
    return driver.findElements(inventoryItems);
  }

  public void addItemToCart(String itemName) {
    WebElement item =
        inventoryItems().stream()
            .filter(el -> el.getText().contains(itemName))
            .findFirst()
            .orElseThrow(() -> new NoSuchElementException("No inventory item named: " + itemName));
    item.findElement(By.xpath(".//button[contains(., 'Add to cart')]")).click();
  }
}
