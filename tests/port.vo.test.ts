import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { Port } from "../src/port.vo";

describe("Port", () => {
  test("happy path", () => {
    expect(v.safeParse(Port, 0).success).toEqual(true);
    expect(v.safeParse(Port, "80").success).toEqual(true);
    expect(v.safeParse(Port, 443).success).toEqual(true);
    expect(v.safeParse(Port, "99999").success).toEqual(true);
  });

  test("transforms null to 0", () => {
    expect(v.safeParse(Port, null)).toMatchObject({ success: true, output: 0 });
  });

  test("transforms string to int", () => {
    expect(v.safeParse(Port, "123")).toMatchObject({ success: true, output: 123 });
  });

  test("rejects negative numbers", () => {
    expect(() => v.parse(Port, -2)).toThrow("port.invalid");
  });

  test("rejects fractions", () => {
    expect(() => v.parse(Port, 1.5)).toThrow("port.type");
  });
});
