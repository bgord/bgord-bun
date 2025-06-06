import { expect, test } from "bun:test";

import { Port } from "../src/port";

test("valid ports: 0, 80, 443, 99999", () => {
  expect(Port.parse(0)).toBe(0);
  expect(Port.parse("80")).toBe(80);
  expect(Port.parse(443)).toBe(443);
  expect(Port.parse("99999")).toBe(99999);
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
  expect(Port.parse("8080")).toBe(8080);
});
