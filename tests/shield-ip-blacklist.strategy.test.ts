import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { ClientIp } from "../src/client-ip.vo";
import { ShieldIpBlacklistStrategy } from "../src/shield-ip-blacklist.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const BLOCKED_IP = v.parse(ClientIp, "10.0.0.1");
const ALLOWED_IP = v.parse(ClientIp, "192.168.1.1");
const INVALID_IP = "not-an-ip";

const strategy = new ShieldIpBlacklistStrategy({ blacklist: [BLOCKED_IP] });

describe("ShieldIpBlacklistStrategy", () => {
  test("happy path", () => {
    const context = new RequestContextBuilder().withIp(ALLOWED_IP).build();

    expect(strategy.evaluate(context)).toEqual(true);
  });

  test("denied - ip in blacklist", () => {
    const context = new RequestContextBuilder().withIp(BLOCKED_IP).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - no ip", () => {
    const context = new RequestContextBuilder().withIp(undefined).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });

  test("denied - invalid ip", () => {
    const context = new RequestContextBuilder().withIp(INVALID_IP).build();

    expect(strategy.evaluate(context)).toEqual(false);
  });
});
