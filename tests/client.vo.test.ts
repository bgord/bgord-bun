import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";
import * as mocks from "./mocks";

describe("Client VO", () => {
  test("fromParts", () => {
    expect(Client.fromParts("1.1.1.1", "UA").toJSON()).toEqual({ ip: "1.1.1.1", ua: "UA" });
  });

  test("prefers x-real-ip", () => {
    const context = mocks.createContext({ "x-real-ip": "9.9.9.9", "user-agent": "UA" });

    expect(Client.fromHonoContext(context).toJSON()).toEqual({ ip: "9.9.9.9", ua: "UA" });
  });

  test("fallback - x-forwarded-for", () => {
    const context = mocks.createContext({ "x-forwarded-for": "8.8.8.8", "user-agent": "UA" });

    expect(Client.fromHonoContext(context).toJSON()).toEqual({ ip: "8.8.8.8", ua: "UA" });
  });

  test("fallback - remote.address", () => {
    const context = mocks.createContext({});

    expect(Client.fromHonoContext(context).toJSON()).toEqual({ ua: "anon", ip: "127.0.0.1" });
  });
});
