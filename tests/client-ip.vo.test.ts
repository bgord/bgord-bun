import { describe, expect, test } from "bun:test";
import { ClientIp, ClientIpError } from "../src/client-ip.vo";

describe("ClientIp VO", () => {
  test("happy path", () => {
    expect(ClientIp.safeParse("127.0.0.1").success).toEqual(true);
    expect(ClientIp.safeParse("anon").success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => ClientIp.parse(null)).toThrow(ClientIpError.Type);
  });

  test("rejects non-string - number", () => {
    expect(() => ClientIp.parse(123)).toThrow(ClientIpError.Type);
  });

  test("rejects invalid default", () => {
    expect(() => ClientIp.parse("anonek")).toThrow(ClientIpError.Type);
  });
});
