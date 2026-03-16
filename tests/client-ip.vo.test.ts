import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { ClientIp } from "../src/client-ip.vo";

describe("ClientIp", () => {
  test("happy path", () => {
    expect(v.safeParse(ClientIp, "127.0.0.1").success).toEqual(true);
  });

  test("rejects empty", () => {
    expect(() => v.parse(ClientIp, "")).toThrow("client.ip.invalid");
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(ClientIp, null)).toThrow("client.ip.invalid");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(ClientIp, 123)).toThrow("client.ip.invalid");
  });
});
