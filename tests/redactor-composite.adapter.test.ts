import { describe, expect, test } from "bun:test";
import type { RedactorPort } from "../src/redactor.port";
import { RedactorCompactArrayAdapter } from "../src/redactor-compact-array.adapter";
import { RedactorCompactObjectAdapter } from "../src/redactor-compact-object.adapter";
import { RedactorCompositeAdapter } from "../src/redactor-composite.adapter";

class UppercaseRedactor implements RedactorPort {
  redact<T>(input: T): T {
    return (typeof input === "string" ? (input.toUpperCase() as any) : input) as T;
  }
}
class SuffixRedactor implements RedactorPort {
  constructor(private readonly suffix: string) {}
  redact<T>(input: T): T {
    return (typeof input === "string" ? ((input + this.suffix) as any) : input) as T;
  }
}

describe("RedactorCompositeAdapter", () => {
  test("keeps the order", () => {
    expect(
      new RedactorCompositeAdapter([new UppercaseRedactor(), new SuffixRedactor("!")]).redact("hello"),
    ).toEqual("HELLO!");
  });

  test("empty pipeline", () => {
    const input = { a: 1 };

    expect(new RedactorCompositeAdapter([]).redact(input)).toEqual(input);
  });

  test("compact array and object pipeline", () => {
    const input = { keep: { a: 1, b: 2 }, summarize: { a: 1, b: [1, 2, 3] } };
    const redactor = new RedactorCompositeAdapter([
      new RedactorCompactArrayAdapter(),
      new RedactorCompactObjectAdapter({ maxKeys: 2 }),
    ]);

    const result = redactor.redact(input);

    expect(result.keep).toEqual(input.keep);
    // @ts-expect-error
    expect(result.summarize).toEqual({ a: 1, b: { length: 3, type: "Array" } });
  });
});
