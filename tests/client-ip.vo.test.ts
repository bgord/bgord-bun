import { describe, expect, test } from "bun:test";
import { ClientIp } from "../src/client-ip.vo";

describe("ClientIp VO", () => {
  test("happy path", () => {
    // @ts-expect-error
    expect(ClientIp.parse("127.0.0.1")).toEqual("127.0.0.1");
    // @ts-expect-error
    expect(ClientIp.parse("::ffff:127.0.0.1")).toEqual("anon");
    // @ts-expect-error
    expect(ClientIp.parse("anon")).toEqual("anon");
    // @ts-expect-error
    expect(ClientIp.parse("anonx")).toEqual("anon");
  });

  test("rejects empty", () => {
    expect(() => ClientIp.parse("")).toThrow("client.ip.empty");
  });

  test("rejects non-string - null", () => {
    expect(() => ClientIp.parse(null)).toThrow("client.ip.type");
  });

  test("rejects non-string - number", () => {
    expect(() => ClientIp.parse(123)).toThrow("client.ip.type");
  });
});
