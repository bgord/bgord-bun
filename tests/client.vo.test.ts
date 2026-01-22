import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";
import { ClientIp } from "../src/client-ip.vo";
import { ClientUserAgent } from "../src/client-user-agent.vo";

// const localFirefox = Client.fromParts("127.0.0.1", ClientUserAgent.parse("firefox"));
// const localChrome = Client.fromParts("127.0.0.1", ClientUserAgent.parse("Chrome"));
// const remoteFirefox = Client.fromParts("0.0.0.0", ClientUserAgent.parse("Firefox"));

// const ip = ClientIp.parse("1.1.1.1");
// const ua = ClientUserAgent.parse("ua");

const ip = "1.1.1.1";
const ipVO = ClientIp.parse(ip);
const invalidIp = "invalid";

const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0";
const uaVO = ClientUserAgent.parse(ua);
const invalidUa = "a".repeat(257);

describe("Client VO", () => {
  test("fromParts", () => {
    expect(Client.fromParts(ip, ua).toJSON()).toEqual({ ip: ipVO, ua: uaVO });
  });

  test("fromParts - invalid ip", () => {
    expect(Client.fromParts(invalidIp, ua).toJSON()).toEqual({ ip: undefined, ua: uaVO });
  });

  test("fromParts - invalid ua", () => {
    expect(Client.fromParts(ip, invalidUa).toJSON()).toEqual({ ip: ipVO, ua: undefined });
  });

  test("fromParts - invalid", () => {
    expect(Client.fromParts(invalidIp, invalidUa).toJSON()).toEqual({ ip: undefined, ua: undefined });
  });

  test("fromParts - undefined ip", () => {
    expect(Client.fromParts(undefined, ua).toJSON()).toEqual({ ip: undefined, ua: uaVO });
  });

  test("fromParts - undefined ua", () => {
    expect(Client.fromParts(ip, undefined).toJSON()).toEqual({ ip: ipVO, ua: undefined });
  });

  test("fromParts - undefined", () => {
    expect(Client.fromParts(undefined, undefined).toJSON()).toEqual({ ip: undefined, ua: undefined });
  });

  test("fromSafeParts", () => {
    expect(Client.fromSafeParts(ipVO, uaVO).toJSON()).toEqual({ ip: ipVO, ua: uaVO });
  });

  test("fromSafeParts - undefined ip", () => {
    expect(Client.fromSafeParts(undefined, uaVO).toJSON()).toEqual({ ip: undefined, ua: uaVO });
  });

  test("fromSafeParts - undefined ua", () => {
    expect(Client.fromSafeParts(ipVO, undefined).toJSON()).toEqual({ ip: ipVO, ua: undefined });
  });

  test("fromSafeParts - undefined", () => {
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
