import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";

const localFirefox = Client.fromParts("127.0.0.1", "firefox");
const localChrome = Client.fromParts("127.0.0.1", "Chrome");
const remoteFirefox = Client.fromParts("0.0.0.0", "Firefox");

describe("Client VO", () => {
  test("fromParts", () => {
    expect(Client.fromParts("1.1.1.1", "UA").toJSON()).toEqual({ ip: "1.1.1.1", ua: "ua" });
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
