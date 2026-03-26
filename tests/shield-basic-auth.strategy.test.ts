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
};

const header = BasicAuth.toHeader(config).get("authorization");
const username = BasicAuth.toHeader({ ...config, username: v.parse(BasicAuthUsername, "wrong") }).get(
  "authorization",
);
const password = BasicAuth.toHeader({ ...config, password: v.parse(BasicAuthPassword, "wrong") }).get(
  "authorization",
);

const strategy = new ShieldBasicAuthStrategy(config);

describe("ShieldBasicAuthStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withHeader("authorization", header as string).build();

    expect(strategy.evaluate(context)).toEqual(true);
  });

  test("denied - missing authorization", () => {
    const context = new RequestContextBuilder().build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - invalid authorization format", () => {
    const context = new RequestContextBuilder().withHeader("authorization", "abc").build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - invalid username", () => {
    const context = new RequestContextBuilder().withHeader("authorization", username as string).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - invalid password", () => {
    const context = new RequestContextBuilder().withHeader("authorization", password as string).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });
});
