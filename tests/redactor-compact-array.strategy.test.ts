import { describe, expect, test } from "bun:test";
import { RedactorCompactArrayStrategy } from "../src/redactor-compact-array.strategy";

const redactor = new RedactorCompactArrayStrategy();

describe("RedactorCompactArrayStrategy", () => {
  test("keeps primitives unchanged", () => {
    expect(redactor.redact(42)).toEqual(42);
    expect(redactor.redact("x")).toEqual("x");
    expect(redactor.redact(false)).toEqual(false);
    expect(redactor.redact(null)).toEqual(null);
    expect(redactor.redact(undefined)).toEqual(undefined);
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
