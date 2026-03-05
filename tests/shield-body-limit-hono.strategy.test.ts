import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ShieldBodyLimitHonoStrategy } from "../src/shield-body-limit-hono.strategy";

const maxSize = tools.Size.fromKb(100);
const shield = new ShieldBodyLimitHonoStrategy({ maxSize });

const app = new Hono().use(shield.handle()).post("/upload", (c) => c.text("ok"));

describe("ShieldBodyLimitHonoStrategy", () => {
  test("happy path - no header", async () => {
    const response = await app.request("/upload", { method: "POST" });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("happy path - below limit", async () => {
    const response = await app.request("/upload", {
      method: "POST",
      headers: { "content-length": tools.Size.fromKb(50).toBytes().toString() },
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("happy path - at the limit", async () => {
    const response = await app.request("/upload", {
      method: "POST",
      headers: { "content-length": maxSize.toBytes().toString() },
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("over the limit", async () => {
    const response = await app.request("/upload", {
      method: "POST",
      headers: { "content-length": tools.Size.fromKb(101).toBytes().toString() },
    });

    expect(response.status).toEqual(413);
    expect(await response.text()).toEqual("shield.body.limit.rejected");
  });

  test("invalid header", async () => {
    const response = await app.request("/upload", {
      method: "POST",
      headers: { "content-length": "invalid" },
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("negative header", async () => {
    const response = await app.request("/upload", { method: "POST", headers: { "content-length": "-100" } });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });
});
