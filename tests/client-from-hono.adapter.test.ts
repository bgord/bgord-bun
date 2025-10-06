import { describe, expect, test } from "bun:test";
import type { Context } from "hono";
import { ClientFromHono } from "../src/client-from-hono.adapter";

function makeContext(headers: Record<string, string | undefined>): Context {
  return {
    req: { header: (name: string) => headers[name.toLowerCase()] ?? undefined },
    env: { server: { requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }) } },
  } as unknown as Context;
}

describe("ClientFromHono", () => {
  test("prefers x-real-ip", () => {
    const context = makeContext({ "x-real-ip": "9.9.9.9", "user-agent": "UA" });
    const out = ClientFromHono.extract(context).toJSON();
    expect(out).toEqual({ ip: "9.9.9.9", ua: "UA" });
  });

  test("falls back to x-forwarded-for then remote.address", () => {
    const contextFirst = makeContext({ "x-forwarded-for": "8.8.8.8", "user-agent": "UA" });
    const resultFirst = ClientFromHono.extract(contextFirst).toJSON();
    expect(resultFirst).toEqual({ ip: "8.8.8.8", ua: "UA" });

    const contextSecond = makeContext({});
    const constextSecond = ClientFromHono.extract(contextSecond).toJSON();
    expect(constextSecond.ua).toEqual("anon");
    expect(typeof constextSecond.ip).toEqual("string");
  });
});
