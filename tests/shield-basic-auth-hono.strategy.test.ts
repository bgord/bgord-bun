import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { BasicAuth } from "../src/basic-auth.service";
import { BasicAuthPassword } from "../src/basic-auth-password.vo";
import { BasicAuthUsername } from "../src/basic-auth-username.vo";
import { ShieldBasicAuthHonoStrategy } from "../src/shield-basic-auth-hono.strategy";

const config = { username: BasicAuthUsername.parse("admin"), password: BasicAuthPassword.parse("password") };
const username = { ...config, username: BasicAuthUsername.parse("wrong") };
const password = { ...config, password: BasicAuthPassword.parse("wrong") };

const shield = new ShieldBasicAuthHonoStrategy(config);

const app = new Hono().use(shield.handle()).get("/ping", (c) => c.text("OK"));

describe("ShieldBasicAuthHonoStrategy", () => {
  test("happy path", async () => {
    const result = await app.request("/ping", { method: "GET", headers: BasicAuth.toHeader(config) });

    expect(result.status).toEqual(200);
    expect(await result.text()).toEqual("OK");
  });

  test("denied - missing authorization", async () => {
    const result = await app.request("/ping", { method: "GET" });

    expect(result.status).toEqual(401);
    expect(await result.text()).toEqual("shield.basic.auth.rejected");
  });

  test("denied - invalid authorization", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ authorization: "abc" }),
    });

    expect(result.status).toEqual(401);
    expect(await result.text()).toEqual("shield.basic.auth.rejected");
  });

  test("denied - invalid username", async () => {
    const result = await app.request("/ping", { method: "GET", headers: username });

    expect(result.status).toEqual(401);
    expect(await result.text()).toEqual("shield.basic.auth.rejected");
  });

  test("denied - invalid password", async () => {
    const result = await app.request("/ping", { method: "GET", headers: password });

    expect(result.status).toEqual(401);
    expect(await result.text()).toEqual("shield.basic.auth.rejected");
  });
});
