import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";
import { ClientIp } from "../src/client-ip.vo";
import { ClientUserAgent } from "../src/client-user-agent.vo";

const localFirefox = Client.fromParts("127.0.0.1", ClientUserAgent.parse("firefox"));
const localChrome = Client.fromParts("127.0.0.1", ClientUserAgent.parse("Chrome"));
const remoteFirefox = Client.fromParts("0.0.0.0", ClientUserAgent.parse("Firefox"));

const ip = ClientIp.parse("1.1.1.1");
const ua = ClientUserAgent.parse("ua");

describe("Client VO", () => {
  test("fromPartsSafe", () => {
    expect(Client.fromPartsSafe(ip, ClientUserAgent.parse("UA")).toJSON()).toEqual({ ip, ua });
  });

  test("fromPartsSafe - null", () => {
    const client = Client.fromPartsSafe(null, null);

    expect(client.ip).toEqual(ClientIp.parse("anon"));
    expect(client.ip.toString()).toEqual("anon");
  });

  test("fromPartsSafe - undefined", () => {
    expect(Client.fromPartsSafe(undefined, undefined).toJSON()).toEqual({
      ip: ClientIp.parse("anon"),
      ua: ClientUserAgent.parse("anon"),
    });
  });

  test("fromParts", () => {
    expect(Client.fromParts("1.1.1.1", "UA").toJSON()).toEqual({ ip, ua });
  });

  test("fromParts - null", () => {
    expect(Client.fromParts(null, null).toJSON()).toEqual({
      ip: ClientIp.parse("anon"),
      ua: ClientUserAgent.parse("anon"),
    });
  });

  test("fromParts - undefined", () => {
    expect(Client.fromParts(undefined, undefined).toJSON()).toEqual({
      ip: ClientIp.parse("anon"),
      ua: ClientUserAgent.parse("anon"),
    });
  });

  test("equals - true", () => {
    expect(localFirefox.equals(localFirefox)).toEqual(true);
  });

  test("equals - false - different ua", () => {
    expect(localFirefox.equals(localChrome)).toEqual(false);
  });

  test("equals - false - different ip", () => {
    const remoteFirefoxSameUa = Client.fromParts("0.0.0.0", "firefox");

    expect(localFirefox.equals(remoteFirefoxSameUa)).toEqual(false);
  });

  test("matchesUa - true", () => {
    expect(remoteFirefox.matchesUa(localFirefox.ua)).toEqual(true);
  });

  test("matchesUa - false", () => {
    expect(localFirefox.matchesUa(ClientUserAgent.parse(localChrome.ip))).toEqual(false);
  });

  test("matchesIp - true", () => {
    expect(localFirefox.matchesIp(localChrome.ip)).toEqual(true);
  });

  test("matchesIp - false", () => {
    expect(localFirefox.matchesIp(remoteFirefox.ip)).toEqual(false);
  });

  test("matchesIp - case sensitivity", () => {
    const client = Client.fromParts(null, "ua");
    const searchIp = ClientIp.parse("ANON");

    expect(client.matchesIp(searchIp)).toEqual(true);
  });
});
