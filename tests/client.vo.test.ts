import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";
import { ClientIp } from "../src/client-ip.vo";
import { ClientUserAgent } from "../src/client-user-agent.vo";
import * as mocks from "./mocks";

const ipVO = ClientIp.parse(mocks.ip);
const invalidIp = "invalid";

const uaVO = ClientUserAgent.parse(mocks.ua);
const invalidUa = "a".repeat(257);

describe("Client VO", () => {
  test("fromParts", () => {
    expect(Client.fromParts(mocks.ip, mocks.ua).toJSON()).toEqual({ ip: ipVO, ua: uaVO });
  });

  test("fromParts - invalid ip", () => {
    expect(Client.fromParts(invalidIp, mocks.ua).toJSON()).toEqual({ ip: undefined, ua: uaVO });
  });

  test("fromParts - invalid ua", () => {
    expect(Client.fromParts(mocks.ip, invalidUa).toJSON()).toEqual({ ip: ipVO, ua: undefined });
  });

  test("fromParts - invalid", () => {
    expect(Client.fromParts(invalidIp, invalidUa).toJSON()).toEqual({ ip: undefined, ua: undefined });
  });

  test("fromParts - missing ip", () => {
    expect(Client.fromParts(undefined, mocks.ua).toJSON()).toEqual({ ip: undefined, ua: uaVO });
  });

  test("fromParts - missing ua", () => {
    expect(Client.fromParts(mocks.ip, undefined).toJSON()).toEqual({ ip: ipVO, ua: undefined });
  });

  test("fromParts - missing", () => {
    expect(Client.fromParts(undefined, undefined).toJSON()).toEqual({ ip: undefined, ua: undefined });
  });

  test("fromSafeParts", () => {
    expect(Client.fromSafeParts(ipVO, uaVO).toJSON()).toEqual({ ip: ipVO, ua: uaVO });
  });

  test("fromSafeParts - missing ip", () => {
    expect(Client.fromSafeParts(undefined, uaVO).toJSON()).toEqual({ ip: undefined, ua: uaVO });
  });

  test("fromSafeParts - missing ua", () => {
    expect(Client.fromSafeParts(ipVO, undefined).toJSON()).toEqual({ ip: ipVO, ua: undefined });
  });

  test("fromSafeParts - missing", () => {
    expect(Client.fromSafeParts(undefined, undefined).toJSON()).toEqual({ ip: undefined, ua: undefined });
  });

  test("equals - true", () => {
    const localFirefox = Client.fromParts("127.0.0.1", "firefox");

    expect(localFirefox.equals(localFirefox)).toEqual(true);
  });

  test("equals - false - different ua", () => {
    const localFirefox = Client.fromParts("127.0.0.1", "firefox");
    const localChrome = Client.fromParts("127.0.0.1", "chrome");

    expect(localFirefox.equals(localChrome)).toEqual(false);
  });

  test("equals - false - different ip", () => {
    const localFirefox = Client.fromParts("127.0.0.1", "firefox");
    const globalFirefox = Client.fromParts("0.0.0.0", "firefox");

    expect(localFirefox.equals(globalFirefox)).toEqual(false);
  });

  test("equals - false - different ua and ip", () => {
    const localFirefox = Client.fromParts("127.0.0.1", "firefox");
    const globalChrome = Client.fromParts("0.0.0.0", "chrome");

    expect(localFirefox.equals(globalChrome)).toEqual(false);
  });

  test("hasSameUa - true", () => {
    const localFirefox = Client.fromParts("127.0.0.1", "firefox");

    expect(localFirefox.hasSameUa(localFirefox)).toEqual(true);
  });

  test("hasSameUa - false - different ua", () => {
    const localFirefox = Client.fromParts("127.0.0.1", "firefox");
    const localChrome = Client.fromParts("127.0.0.1", "chrome");

    expect(localFirefox.hasSameUa(localChrome)).toEqual(false);
  });

  test("hasSameUa - false - one undefined", () => {
    const localUnknown = Client.fromParts("127.0.0.1", undefined);
    const localChrome = Client.fromParts("127.0.0.1", "chrome");

    expect(localUnknown.hasSameUa(localChrome)).toEqual(false);
  });

  test("hasSameUa - false - both undefined", () => {
    const localUnknown = Client.fromParts("127.0.0.1", undefined);

    expect(localUnknown.hasSameUa(localUnknown)).toEqual(false);
  });

  test("hasSameIp - true", () => {
    const localFirefox = Client.fromParts("127.0.0.1", "firefox");

    expect(localFirefox.hasSameIp(localFirefox)).toEqual(true);
  });

  test("hasSameIp - false - different ip", () => {
    const localFirefox = Client.fromParts("127.0.0.1", "firefox");
    const globalFirefox = Client.fromParts("0.0.0.0", "firefox");

    expect(localFirefox.hasSameIp(globalFirefox)).toEqual(false);
  });

  test("hasSameIp - false - one undefined", () => {
    const unknownFirefox = Client.fromParts(undefined, "firefox");
    const localFirefox = Client.fromParts("127.0.0.1", "firefox");

    expect(unknownFirefox.hasSameIp(localFirefox)).toEqual(false);
  });

  test("hasSameIp - false - both undefined", () => {
    const unknownFirefox = Client.fromParts(undefined, "firefox");

    expect(unknownFirefox.hasSameIp(unknownFirefox)).toEqual(false);
  });

  test("toJSON", () => {
    expect(Client.fromSafeParts(ipVO, uaVO).toJSON()).toEqual({ ip: ipVO, ua: uaVO });
  });
});
