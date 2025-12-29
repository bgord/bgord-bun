import { describe, expect, test } from "bun:test";
import type { RedactorStrategy } from "../src/redactor.strategy";
import { RedactorCompactArrayStrategy } from "../src/redactor-compact-array.strategy";
import { RedactorCompactObjectStrategy } from "../src/redactor-compact-object.strategy";
import { RedactorCompositeStrategy } from "../src/redactor-composite.strategy";

class UppercaseRedactor implements RedactorStrategy {
  redact<T>(input: T): T {
    return (typeof input === "string" ? (input.toUpperCase() as any) : input) as T;
  }
}
class SuffixRedactor implements RedactorStrategy {
  constructor(private readonly suffix: string) {}

  redact<T>(input: T): T {
    return (typeof input === "string" ? ((input + this.suffix) as any) : input) as T;
  }
}

describe("RedactorCompositeStrategy", () => {
  test("keeps the order", () => {
    const redactor = new RedactorCompositeStrategy([new UppercaseRedactor(), new SuffixRedactor("!")]);

    expect(redactor.redact("hello")).toEqual("HELLO!");
  });

  test("empty pipeline", () => {
    const input = { a: 1 };
    const redactor = new RedactorCompositeStrategy([]);

    expect(redactor.redact(input)).toEqual(input);
  });

  test("compact array and object pipeline", () => {
    const input = { keep: { a: 1, b: 2 }, summarize: { a: 1, b: [1, 2, 3] } };
    const redactor = new RedactorCompositeStrategy([
      new RedactorCompactArrayStrategy(),
      new RedactorCompactObjectStrategy({ maxKeys: 2 }),
    ]);

    const result = redactor.redact(input);

    expect(result.keep).toEqual(input.keep);
    // @ts-expect-error
    expect(result.summarize).toEqual({ a: 1, b: { length: 3, type: "Array" } });
  });
});
