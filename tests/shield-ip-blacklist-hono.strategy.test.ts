import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import * as v from "valibot";
import { ClientIp } from "../src/client-ip.vo";
import {
  ShieldIpBlacklistError,
  ShieldIpBlacklistHonoStrategy,
} from "../src/shield-ip-blacklist-hono.strategy";

const BLOCKED_IP = v.parse(ClientIp, "10.0.0.1");
const ALLOWED_IP = "192.168.1.1";
const INVALID_IP = "not-an-ip";

const shield = new ShieldIpBlacklistHonoStrategy({ blacklist: [BLOCKED_IP] });

const app = new Hono()
  .use(shield.handle())
  .get("/ping", (c) => c.text("OK"))
  .onError((error, c) => {
    if (error.message === ShieldIpBlacklistError.message) {
      return c.json({ message: ShieldIpBlacklistError.message, _known: true }, ShieldIpBlacklistError.status);
    }
    return c.json({}, 500);
  });

describe("ShieldIpBlacklistHonoStrategy", () => {
  test("happy path", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ "x-forwarded-for": ALLOWED_IP }),
    });

    expect(result.status).toEqual(200);
  });

  test("denied - ip in blacklist", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ "x-forwarded-for": BLOCKED_IP }),
    });
    const json = await result.json();

    expect(result.status).toEqual(403);
    expect(json.message).toEqual("shield.ip.blacklist.rejected");
  });

  test("denied - invalid ip", async () => {
    const result = await app.request("/ping", {
      method: "GET",
      headers: new Headers({ "x-forwarded-for": INVALID_IP }),
    });
    const json = await result.json();

    expect(result.status).toEqual(403);
    expect(json.message).toEqual("shield.ip.blacklist.rejected");
  });
});
