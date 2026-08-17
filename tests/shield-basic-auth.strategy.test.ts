import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { BasicAuth } from "../src/basic-auth.service";
import { BasicAuthPassword } from "../src/basic-auth-password.vo";
import { BasicAuthUsername } from "../src/basic-auth-username.vo";
import { ShieldBasicAuthStrategy } from "../src/shield-basic-auth.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const config = {
  username: v.parse(BasicAuthUsername, "admin"),
  password: v.parse(BasicAuthPassword, "password"),
  realm: "Restricted",
};

const header = BasicAuth.toHeaderValue(config).authorization;
const username = BasicAuth.toHeaderValue({
  ...config,
  username: v.parse(BasicAuthUsername, "wrong"),
}).authorization;
const password = BasicAuth.toHeaderValue({
  ...config,
  password: v.parse(BasicAuthPassword, "wrong"),
}).authorization;

const strategy = new ShieldBasicAuthStrategy(config);

describe("ShieldBasicAuthStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withHeader("authorization", header).build();

    expect(strategy.evaluate(context)).toEqual(true);
  });

  test("happy path - password containing a colon", () => {
    const config = {
      username: v.parse(BasicAuthUsername, "admin"),
      password: v.parse(BasicAuthPassword, "pa:ss"),
      realm: "Restricted",
    };
    const context = new RequestContextBuilder()
      .withHeader("authorization", BasicAuth.toHeaderValue(config).authorization)
      .build();

    expect(new ShieldBasicAuthStrategy(config).evaluate(context)).toEqual(true);
  });

  test("denied - missing authorization", () => {
    const context = new RequestContextBuilder().build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - invalid authorization format", () => {
    const context = new RequestContextBuilder().withHeader("authorization", "abc").build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - credentials without a separator", () => {
    const config = {
      username: v.parse(BasicAuthUsername, "a"),
      password: v.parse(BasicAuthPassword, "ab"),
      realm: "Restricted",
    };
    const context = new RequestContextBuilder().withHeader("authorization", `Basic ${btoa("ab")}`).build();

    expect(new ShieldBasicAuthStrategy(config).evaluate(context)).toEqual(false);
  });

  test("denied - different-length username", () => {
    const shorter = BasicAuth.toHeaderValue({
      ...config,
      username: v.parse(BasicAuthUsername, "ad"),
    }).authorization;

    const context = new RequestContextBuilder().withHeader("authorization", shorter).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - invalid username", () => {
    const context = new RequestContextBuilder().withHeader("authorization", username).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - invalid password", () => {
    const context = new RequestContextBuilder().withHeader("authorization", password).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - same-length wrong password", () => {
    const password = BasicAuth.toHeaderValue({
      username: v.parse(BasicAuthUsername, "admin"),
      password: v.parse(BasicAuthPassword, "passworD"),
    }).authorization;

    const context = new RequestContextBuilder().withHeader("authorization", password).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });
});
