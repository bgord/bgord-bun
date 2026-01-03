import { describe, expect, spyOn, test } from "bun:test";
import { ClientFromHono } from "../src/client-from-hono.adapter";
import { ClientIp } from "../src/client-ip.vo";
import { ClientUserAgent } from "../src/client-user-agent.vo";
import * as mocks from "./mocks";

describe("ClientFromHono", () => {
  test("prefers x-real-ip", () => {
    const context = mocks.createContext({ "x-real-ip": "9.9.9.9", "user-agent": "UA" });

    expect(ClientFromHono.translate(context).toJSON()).toEqual({
      ip: ClientIp.parse("9.9.9.9"),
      ua: ClientUserAgent.parse("ua"),
    });
  });

  test("fallback - x-forwarded-for", () => {
    const context = mocks.createContext({ "x-forwarded-for": "8.8.8.8", "user-agent": "UA" });

    expect(ClientFromHono.translate(context).toJSON()).toEqual({
      ip: ClientIp.parse("8.8.8.8"),
      ua: ClientUserAgent.parse("ua"),
    });
  });

  test("fallback - remote.address", () => {
    const context = mocks.createContext({});

    expect(ClientFromHono.translate(context).toJSON()).toEqual({
      ip: ClientIp.parse("127.0.0.1"),
      ua: ClientUserAgent.parse("anon"),
    });
  });

  test("fallback - missing connection info", () => {
    // @ts-expect-error
    spyOn(ClientFromHono, "retrieveConnInfo").mockReturnValue(undefined);
    const context = mocks.createContext({});

    expect(ClientFromHono.translate(context).toJSON()).toEqual({
      ip: ClientIp.parse("anon"),
      ua: ClientUserAgent.parse("anon"),
    });
  });

  test("fallback - missing remote info", () => {
    const context = mocks.createContext({});

    // @ts-expect-error
    spyOn(ClientFromHono, "retrieveConnInfo").mockReturnValue({});

    expect(ClientFromHono.translate(context).toJSON()).toEqual({
      ip: ClientIp.parse("anon"),
      ua: ClientUserAgent.parse("anon"),
    });
  });
});
