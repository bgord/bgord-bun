import { describe, expect, test } from "bun:test";
import { ClientFromHono } from "../src/client-from-hono.adapter";
import * as mocks from "./mocks";

describe("ClientFromHono", () => {
  test("prefers x-real-ip", () => {
    const context = mocks.createContext({ "x-real-ip": "9.9.9.9", "user-agent": "UA" });

    expect(ClientFromHono.translate(context).toJSON()).toEqual({ ip: "9.9.9.9", ua: "ua" });
  });

  test("fallback - x-forwarded-for", () => {
    const context = mocks.createContext({ "x-forwarded-for": "8.8.8.8", "user-agent": "UA" });

    expect(ClientFromHono.translate(context).toJSON()).toEqual({ ip: "8.8.8.8", ua: "ua" });
  });

  test("fallback - remote.address", () => {
    const context = mocks.createContext({});

    expect(ClientFromHono.translate(context).toJSON()).toEqual({ ua: "anon", ip: "127.0.0.1" });
  });
});
