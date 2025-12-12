import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { BasicAuth } from "../src/basic-auth.service";
import { BasicAuthPassword } from "../src/basic-auth-password.vo";
import { BasicAuthUsername } from "../src/basic-auth-username.vo";
import { ShieldBasicAuthAdapter } from "../src/shield-basic-auth.adapter";

const config = { username: BasicAuthUsername.parse("admin"), password: BasicAuthPassword.parse("password") };

const basicAuthShield = new ShieldBasicAuthAdapter(config);

describe("ShieldBasicAuthAdapter", () => {
  test("happy path", async () => {
    const app = new Hono().use(basicAuthShield.verify).get("/ping", (c) => c.text("OK"));

    const result = await app.request("/ping", { method: "GET", headers: BasicAuth.toHeader(config) });

    expect(result.status).toEqual(200);
  });

  test("denied - no authorization", async () => {
    const app = new Hono().use(basicAuthShield.verify).get("/ping", () => expect.unreachable());

    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(401);
  });

  test("denied - invalid authorization", async () => {
    const app = new Hono().use(basicAuthShield.verify).get("/ping", () => expect.unreachable());

    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ authorization: "abc" }),
    });

    expect(result.status).toEqual(401);
  });
});
