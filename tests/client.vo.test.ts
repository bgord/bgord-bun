import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";
import * as mocks from "./mocks";

const localFirefox = Client.fromParts("127.0.0.1", "firefox");
const localChrome = Client.fromParts("127.0.0.1", "Chrome");
const remoteFirefox = Client.fromParts("0.0.0.0", "Firefox");

describe("Client VO", () => {
  test("fromParts", () => {
    expect(Client.fromParts("1.1.1.1", "UA").toJSON()).toEqual({ ip: "1.1.1.1", ua: "ua" });
  });

  test("prefers x-real-ip", () => {
    const context = mocks.createContext({ "x-real-ip": "9.9.9.9", "user-agent": "UA" });

    expect(Client.fromHonoContext(context).toJSON()).toEqual({ ip: "9.9.9.9", ua: "ua" });
  });

  test("fallback - x-forwarded-for", () => {
    const context = mocks.createContext({ "x-forwarded-for": "8.8.8.8", "user-agent": "UA" });

    expect(Client.fromHonoContext(context).toJSON()).toEqual({ ip: "8.8.8.8", ua: "ua" });
  });

  test("fallback - remote.address", () => {
    const context = mocks.createContext({});

    expect(Client.fromHonoContext(context).toJSON()).toEqual({ ua: "anon", ip: "127.0.0.1" });
  });

  test("equals - true", () => {
    expect(localFirefox.equals(localFirefox)).toEqual(true);
  });

  test("equals - false", () => {
    expect(localFirefox.equals(localChrome)).toEqual(false);
  });

  test("matchesUa - true", () => {
    expect(remoteFirefox.matchesUa(localFirefox.ua)).toEqual(true);
  });

  test("matchesUa - false", () => {
    expect(localFirefox.matchesUa(localChrome.ip)).toEqual(false);
  });

  test("matchesIp - true", () => {
    expect(localFirefox.matchesIp(localChrome.ip)).toEqual(true);
  });

  test("matchesIp - false", () => {
    expect(localFirefox.matchesIp(remoteFirefox.ip)).toEqual(false);
  });
});
