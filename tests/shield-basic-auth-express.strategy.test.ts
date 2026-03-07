import { describe, expect, test } from "bun:test";
import express from "express";
import request from "supertest";
import { BasicAuth } from "../src/basic-auth.service";
import { BasicAuthPassword } from "../src/basic-auth-password.vo";
import { BasicAuthUsername } from "../src/basic-auth-username.vo";
import { ShieldBasicAuthExpressStrategy } from "../src/shield-basic-auth-express.strategy";

const config = { username: BasicAuthUsername.parse("admin"), password: BasicAuthPassword.parse("password") };
const username = { ...config, username: BasicAuthUsername.parse("wrong") };
const password = { ...config, password: BasicAuthPassword.parse("wrong") };

const shield = new ShieldBasicAuthExpressStrategy(config);

const app = express()
  .use(shield.handle())
  .get("/ping", (_request, response) => response.send("OK"));

describe("ShieldBasicAuthExpressStrategy", () => {
  test("happy path", async () => {
    const headers = BasicAuth.toHeader(config);
    const result = await request(app).get("/ping").set("authorization", headers.get("authorization")!);

    expect(result.status).toEqual(200);
    expect(result.text).toEqual("OK");
  });

  test("denied - missing authorization", async () => {
    const result = await request(app).get("/ping");

    expect(result.status).toEqual(401);
    expect(result.text).toEqual("shield.basic.auth.rejected");
  });

  test("denied - invalid authorization", async () => {
    const result = await request(app).get("/ping").set("authorization", "abc");

    expect(result.status).toEqual(401);
    expect(result.text).toEqual("shield.basic.auth.rejected");
  });

  test("denied - invalid username", async () => {
    const headers = BasicAuth.toHeader(username);
    const result = await request(app).get("/ping").set("authorization", headers.get("authorization")!);

    expect(result.status).toEqual(401);
    expect(result.text).toEqual("shield.basic.auth.rejected");
  });

  test("denied - invalid password", async () => {
    const headers = BasicAuth.toHeader(password);
    const result = await request(app).get("/ping").set("authorization", headers.get("authorization")!);

    expect(result.status).toEqual(401);
    expect(result.text).toEqual("shield.basic.auth.rejected");
  });
});
