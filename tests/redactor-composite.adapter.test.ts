import { describe, expect, test } from "bun:test";
import type { RedactorPort } from "../src/redactor.port";
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
  test("applies redactors in order", () => {
    const composite = new RedactorCompositeAdapter([new UppercaseRedactor(), new SuffixRedactor("!")]);
    expect(composite.redact("hello")).toBe("HELLO!");
  });

  test("handles empty pipeline (no-op)", () => {
    const composite = new RedactorCompositeAdapter([]);
    const input = { a: 1 };
    expect(composite.redact(input)).toEqual(input);
  });
});
