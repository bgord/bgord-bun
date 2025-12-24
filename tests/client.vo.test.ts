import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";
import { ClientUserAgent } from "../src/client-user-agent.vo";

const localFirefox = Client.fromParts("127.0.0.1", ClientUserAgent.parse("firefox"));
const localChrome = Client.fromParts("127.0.0.1", ClientUserAgent.parse("Chrome"));
const remoteFirefox = Client.fromParts("0.0.0.0", ClientUserAgent.parse("Firefox"));

const ua = ClientUserAgent.parse("ua");

describe("Client VO", () => {
  test("fromPartsSafe", () => {
    expect(Client.fromPartsSafe("1.1.1.1", ClientUserAgent.parse("UA")).toJSON()).toEqual({
      ip: "1.1.1.1",
      ua,
    });
  });

  test("fromParts", () => {
    expect(Client.fromParts("1.1.1.1", "UA").toJSON()).toEqual({ ip: "1.1.1.1", ua });
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
    expect(localFirefox.matchesUa(ClientUserAgent.parse(localChrome.ip))).toEqual(false);
  });

  test("matchesIp - true", () => {
    expect(localFirefox.matchesIp(localChrome.ip)).toEqual(true);
  });

  test("matchesIp - false", () => {
    expect(localFirefox.matchesIp(remoteFirefox.ip)).toEqual(false);
  });
});
