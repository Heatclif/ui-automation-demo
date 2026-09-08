package com.demo.base;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/** Reads {@code config.properties} once. Selenium's analogue of a Playwright project's baseURL. */
public final class Config {
  private static final Properties PROPERTIES = load();

  private Config() {}

  private static Properties load() {
    Properties props = new Properties();
    try (InputStream in = Config.class.getClassLoader().getResourceAsStream("config.properties")) {
      if (in == null) {
        throw new IllegalStateException("config.properties not found on classpath");
      }
      props.load(in);
    } catch (IOException e) {
      throw new IllegalStateException("Failed to load config.properties", e);
    }
    return props;
  }

  public static String get(String key) {
    String value = PROPERTIES.getProperty(key);
    if (value == null) {
      throw new IllegalStateException("Missing config key: " + key);
    }
    return value;
  }
}
