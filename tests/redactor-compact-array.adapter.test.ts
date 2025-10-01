import { describe, expect, test } from "bun:test";
import { RedactorCompactArrayAdapter } from "../src/redactor-compact-array.adapter";

const redactor = new RedactorCompactArrayAdapter();

describe("RedactorCompactAdapter", () => {
  test("keeps primitives unchanged", () => {
    expect(redactor.redact(42)).toBe(42);
    expect(redactor.redact("x")).toBe("x");
    expect(redactor.redact(false)).toBe(false);
    expect(redactor.redact(null)).toBe(null);
    expect(redactor.redact(undefined)).toBeUndefined();
  });

  test("summarizes arrays", () => {
    // @ts-expect-error
    expect(redactor.redact([1, 2, 3])).toEqual({ type: "Array", length: 3 });
    // @ts-expect-error
    expect(redactor.redact([])).toEqual({ type: "Array", length: 0 });
  });

  test("summarizes nested arrays inside objects", () => {
    // @ts-expect-error
    expect(redactor.redact({ a: [1, 2], b: { c: [3] } })).toEqual({
      a: { type: "Array", length: 2 },
      b: { c: { type: "Array", length: 1 } },
    });
  });
});
