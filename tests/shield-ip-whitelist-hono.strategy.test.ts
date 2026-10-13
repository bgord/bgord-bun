import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import * as v from "valibot";
import { ClientIp } from "../src/client-ip.vo";
import { ErrorClassifierHttpExceptionHonoStrategy } from "../src/error-classifier-http-exception-hono.strategy";
import { ErrorHonoHandler } from "../src/error-hono.handler";
import { HttpExceptionErrors } from "../src/http-exception-errors";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { ShieldIpWhitelistHonoStrategy } from "../src/shield-ip-whitelist-hono.strategy";

const onError = new ErrorHonoHandler([new ErrorClassifierHttpExceptionHonoStrategy([HttpExceptionErrors])], {
  Logger: new LoggerNoopAdapter(),
}).handle();

const ALLOWED_IP = v.parse(ClientIp, "192.168.1.1");
const BLOCKED_IP = "10.0.0.1";
const INVALID_IP = "not-an-ip";

const connInfo = (address: string | null) => ({
  server: { requestIP: () => (address ? { address } : null) },
});

const shield = new ShieldIpWhitelistHonoStrategy({ whitelist: [ALLOWED_IP] });

const app = new Hono()
  .use(shield.handle())
  .get("/ping", () => new Response("OK"))
  .onError(onError);

describe("ShieldIpWhitelistHonoStrategy", () => {
  test("happy path", async () => {
    const result = await app.request("/ping", { method: "GET" }, connInfo(ALLOWED_IP));

    expect(result.status).toEqual(200);
  });

  test("denied - ip not in whitelist", async () => {
    const result = await app.request("/ping", { method: "GET" }, connInfo(BLOCKED_IP));
    const json = await result.json();

    expect(result.status).toEqual(403);
    expect(json.message).toEqual("shield.ip.whitelist.rejected");
  });

  test("denied - no ip", async () => {
    const result = await app.request("/ping", { method: "GET" }, connInfo(null));
    const json = await result.json();

    expect(result.status).toEqual(403);
    expect(json.message).toEqual("shield.ip.whitelist.rejected");
  });

  test("denied - invalid ip", async () => {
    const result = await app.request("/ping", { method: "GET" }, connInfo(INVALID_IP));
    const json = await result.json();

    expect(result.status).toEqual(403);
    expect(json.message).toEqual("shield.ip.whitelist.rejected");
  });

  test("denied - spoofed proxy headers", async () => {
    const result = await app.request(
      "/ping",
      { method: "GET", headers: new Headers({ "x-real-ip": ALLOWED_IP, "x-forwarded-for": ALLOWED_IP }) },
      connInfo(BLOCKED_IP),
    );
    const json = await result.json();

    expect(result.status).toEqual(403);
    expect(json.message).toEqual("shield.ip.whitelist.rejected");
  });
});
