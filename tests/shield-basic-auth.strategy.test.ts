import { describe, expect, test } from "bun:test";
import { BasicAuth } from "../src/basic-auth.service";
import { BasicAuthPassword } from "../src/basic-auth-password.vo";
import { BasicAuthUsername } from "../src/basic-auth-username.vo";
import { ShieldBasicAuthStrategy } from "../src/shield-basic-auth.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const config = { username: BasicAuthUsername.parse("admin"), password: BasicAuthPassword.parse("password") };

const header = BasicAuth.toHeader(config).get("authorization")!;
const username = BasicAuth.toHeader({ ...config, username: BasicAuthUsername.parse("wrong") }).get(
  "authorization",
)!;
const password = BasicAuth.toHeader({ ...config, password: BasicAuthPassword.parse("wrong") }).get(
  "authorization",
)!;

const strategy = new ShieldBasicAuthStrategy(config);

describe("ShieldBasicAuthStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withHeader("authorization", header).build();

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
    const context = new RequestContextBuilder().withHeader("authorization", username).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - invalid password", () => {
    const context = new RequestContextBuilder().withHeader("authorization", password).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });
});
