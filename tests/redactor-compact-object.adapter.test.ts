import { describe, expect, test } from "bun:test";
import { RedactorCompactObjectAdapter } from "../src/redactor-compact-object.adapter";

const redactor = new RedactorCompactObjectAdapter();

describe("RedactorObjectAdapter", () => {
  test("happy path", () => {
    const redactor = new RedactorCompactObjectAdapter({ maxKeys: 5 });
    const wide = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`k${i}`, i]));

    // @ts-expect-error
    expect(redactor.redact(wide)).toEqual({ type: "Object", keys: 8 });
  });

  test("happy path - nested", () => {
    const redactor = new RedactorCompactObjectAdapter({ maxKeys: 2 });
    const input = {
      narrow: { a: 1, b: 2 },
      branch: { wide: { a: 1, b: 2, c: 3 }, deep: { nested: { x: 1, y: 2, z: 3 } } },
    };

    const result = redactor.redact(input);

    expect(result.narrow).toEqual({ a: 1, b: 2 });
    // @ts-expect-error
    expect(result.branch.wide).toEqual({ type: "Object", keys: 3 });
    // @ts-expect-error
    expect(result.branch.deep.nested).toEqual({ type: "Object", keys: 3 });
  });

  test("keeps primitives unchanged", () => {
    expect(redactor.redact(42)).toEqual(42);
    expect(redactor.redact("x")).toEqual("x");
    expect(redactor.redact(false)).toEqual(false);
    expect(redactor.redact(null)).toEqual(null);
    expect(redactor.redact(undefined)).toEqual(undefined);
  });

  test("keeps small objects unchanged", () => {
    const maxKeys = 5;
    const redactor = new RedactorCompactObjectAdapter({ maxKeys });
    const boundary = Object.fromEntries(Array.from({ length: maxKeys }, (_, i) => [`k${i}`, i]));

    expect(redactor.redact(boundary)).toEqual(boundary);
  });

  test("keep non-objects unchanged ", () => {
    class Custom {
      constructor(public value: number) {}
    }

    const redactor = new RedactorCompactObjectAdapter({ maxKeys: 10 });
    const input = {
      bag: {
        arr: [1, 2, 3],
        when: new Date("2020-01-01T00:00:00Z"),
        map: new Map([["a", 1]]),
        set: new Set([1, 2]),
        inst: new Custom(7),
      },
    };

    const result = redactor.redact(input);

    expect(Array.isArray(result.bag.arr)).toEqual(true);
    expect(result.bag.arr).toEqual([1, 2, 3]);

    expect(result.bag.when instanceof Date).toEqual(true);

    expect(result.bag.map instanceof Map).toEqual(true);
    expect(result.bag.map.get("a")).toEqual(1);

    expect(result.bag.set instanceof Set).toEqual(true);
    expect(result.bag.set.has(2)).toEqual(true);

    expect(result.bag.inst instanceof Custom).toEqual(true);
    expect(result.bag.inst.value).toEqual(7);
  });

  test("mixed structures", () => {
    const redactor = new RedactorCompactObjectAdapter({ maxKeys: 2 });
    const input = { keep: { a: 1, b: 2 }, summarize: { a: 1, b: 2, c: [1, 2, 3] } };

    const result = redactor.redact(input);

    expect(result.keep).toEqual({ a: 1, b: 2 });
    // @ts-expect-error
    expect(result.summarize).toEqual({ type: "Object", keys: 3 });
  });
});
