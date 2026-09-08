package com.demo.saucedemo.data;

public record SauceUser(String username, String password) {

  public static final SauceUser STANDARD_USER = new SauceUser("standard_user", "secret_sauce");
  public static final SauceUser LOCKED_OUT_USER = new SauceUser("locked_out_user", "secret_sauce");
}
