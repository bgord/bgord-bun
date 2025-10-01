import { describe, expect, test } from "bun:test";
import type { RedactorPort } from "../src/redactor.port";
import { RedactorCompactAdapter } from "../src/redactor-compact.adapter";
import { RedactorCompositeAdapter } from "../src/redactor-composite.adapter";
import { RedactorObjectAdapter } from "../src/redactor-object.adapter";

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
  test("applies redactors in order", () => {
    const composite = new RedactorCompositeAdapter([new UppercaseRedactor(), new SuffixRedactor("!")]);
    expect(composite.redact("hello")).toBe("HELLO!");
  });

  test("handles empty pipeline (no-op)", () => {
    const composite = new RedactorCompositeAdapter([]);
    const input = { a: 1 };
    expect(composite.redact(input)).toEqual(input);
  });

  test("compact and object pipeline", () => {
    const input = { keep: { a: 1, b: 2 }, summarize: { a: 1, b: [1, 2, 3] } };

    const redactor = new RedactorCompositeAdapter([
      new RedactorCompactAdapter(),
      new RedactorObjectAdapter({ maxKeys: 2 }),
    ]);

    const result = redactor.redact(input);

    expect(result.keep).toEqual(input.keep);
    // @ts-expect-error
    expect(result.summarize).toEqual({ a: 1, b: { length: 3, type: "Array" } });
  });
});
