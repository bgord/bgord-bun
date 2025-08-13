import { describe, expect, test } from "bun:test";
import { Port } from "../src/port.vo";

describe("Port", () => {
  test("valid ports: 0, 80, 443, 99999", () => {
    expect(Port.safeParse(0).success).toBeTruthy();
    expect(Port.safeParse("80").success).toBeTruthy();
    expect(Port.safeParse(443).success).toBeTruthy();
    expect(Port.safeParse("99999").success).toBeTruthy();
  });

  test("throws on negative numbers", () => {
    expect(() => Port.parse(-1)).toThrow();
    expect(() => Port.parse("-42")).toThrow();
  });

  test("throws on ports > 99999", () => {
    expect(() => Port.parse(100000)).toThrow();
    expect(() => Port.parse("123456")).toThrow();
  });

  test("throws on invalid input (non-numeric)", () => {
    expect(() => Port.parse("not-a-number")).toThrow();
    expect(() => Port.parse({})).toThrow();
    expect(() => Port.parse(undefined)).toThrow();
  });

  test("coerces numeric strings", () => {
    expect(Port.safeParse("8080").success).toBeTruthy();
  });
});
