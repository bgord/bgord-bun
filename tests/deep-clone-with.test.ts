import { describe, expect, test } from "bun:test";
import { deepCloneWith } from "../src/deep-clone-with";

const noop = () => undefined;

describe("deepCloneWith", () => {
  test("passthrough - primitives", () => {
    expect(deepCloneWith(5, noop)).toEqual(5);
    expect(deepCloneWith("text", noop)).toEqual("text");
    expect(deepCloneWith(true, noop)).toEqual(true);
  });

  test("passthrough - plain objects", () => {
    const input = { a: 1, b: { c: 2 } };

    expect(deepCloneWith(input, noop)).toEqual(input);
  });

  test("passthrough - non-plain object", () => {
    const input = { date: new Date() };

    expect(deepCloneWith(input, noop)).toEqual(input);
  });

  test("passthrough - arrays", () => {
    const input = [1, { a: 2 }];

    expect(deepCloneWith(input, noop)).toEqual(input);
  });

  test("passthrough - symbol keys", () => {
    const symbol = Symbol("public");

    const result = deepCloneWith({ [symbol]: 1 }, () => undefined);

    expect(result[symbol]).toEqual(1);
  });

  test("replacer - matched", () => {
    const result = deepCloneWith({ public: "public", secret: "secret" }, (value) =>
      value === "secret" ? "***" : undefined,
    );

    expect(result).toEqual({ public: "public", secret: "***" });
  });

  test("replacer - root - default", () => {
    const result = deepCloneWith({ a: 1 }, (_value, key) =>
      key === undefined ? { replaced: true } : undefined,
    );

    expect(result).toEqual({ a: 1 });
  });

  test("replacer - root - replaced", () => {
    const result = deepCloneWith(
      { a: 1 },
      (_value, key) => (key === undefined ? { replaced: true } : undefined),
      { allowRootReplace: true },
    );

    // @ts-expect-error Changed schema assertion
    expect(result).toEqual({ replaced: true });
  });
});
