import { describe, expect, test } from "bun:test";
import { Port, PortError } from "../src/port.vo";

describe("Port VO", () => {
  test("happy path", () => {
    expect(Port.safeParse(0).success).toEqual(true);
    expect(Port.safeParse("80").success).toEqual(true);
    expect(Port.safeParse(443).success).toEqual(true);
    expect(Port.safeParse("99999").success).toEqual(true);
  });

  test("transforms null to 0", () => {
    // @ts-expect-error
    expect(Port.safeParse(null)).toEqual({ success: true, data: 0 });
  });

  test("transforms string to int", () => {
    // @ts-expect-error
    expect(Port.safeParse("123")).toEqual({ success: true, data: 123 });
  });

  test("transforms negative numbers to 1", () => {
    expect(() => Port.parse(-2)).toThrow(PortError.Invalid);
  });

  test("rejects fractions", () => {
    expect(() => Port.parse(1.5)).toThrow(PortError.Type);
  });
});
