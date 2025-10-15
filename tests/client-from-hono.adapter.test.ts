import { describe, expect, test } from "bun:test";
import { ClientFromHono } from "../src/client-from-hono.adapter";
import * as mocks from "./mocks";

describe("ClientFromHono", () => {
  test("prefers x-real-ip", () => {
    const context = mocks.createContext({ "x-real-ip": "9.9.9.9", "user-agent": "UA" });

    expect(ClientFromHono.extract(context).toJSON()).toEqual({ ip: "9.9.9.9", ua: "UA" });
  });

  test("fallback - x-forwarded-for", () => {
    const context = mocks.createContext({ "x-forwarded-for": "8.8.8.8", "user-agent": "UA" });

    expect(ClientFromHono.extract(context).toJSON()).toEqual({ ip: "8.8.8.8", ua: "UA" });
  });

  test("fallback - remote.address", () => {
    const context = mocks.createContext({});
    const result = ClientFromHono.extract(context).toJSON();

    expect(result.ua).toEqual("anon");
    expect(result.ip).toEqual("127.0.0.1");
  });
});
