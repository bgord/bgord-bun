import { describe, expect, test } from "bun:test";
import { ClientIp } from "../src/client-ip.vo";

describe("ClientIp VO", () => {
  test("happy path", () => {
    expect(ClientIp.safeParse("127.0.0.1").success).toEqual(true);
  });

  test("rejects empty", () => {
    expect(() => ClientIp.parse("")).toThrow("client.ip.invalid");
  });

  test("rejects non-string - null", () => {
    expect(() => ClientIp.parse(null)).toThrow("client.ip.invalid");
  });

  test("rejects non-string - number", () => {
    expect(() => ClientIp.parse(123)).toThrow("client.ip.invalid");
  });
});
