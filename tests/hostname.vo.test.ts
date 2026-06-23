import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { Hostname } from "../src/hostname.vo";

describe("Hostname", () => {
  test("happy path", () => {
    expect(v.safeParse(Hostname, "example.com").success).toEqual(true);
    expect(v.safeParse(Hostname, "www.example.com").success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(Hostname, null)).toThrow("hostname.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(Hostname, 123)).toThrow("hostname.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(Hostname, "")).toThrow("hostname.invalid");
  });

  test("rejects ip", () => {
    expect(() => v.parse(Hostname, "127.0.0.1")).toThrow("hostname.invalid");
  });
});
