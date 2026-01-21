import { describe, expect, test } from "bun:test";
import { RedactorMetadataCompactArrayStrategy } from "../src/redactor-metadata-compact-array.strategy";

const redactor = new RedactorMetadataCompactArrayStrategy();

describe("RedactorMetadataCompactArrayStrategy", () => {
  test("redact - metadata array", () => {
    const input = { metadata: ["admin", "user"] };

    // @ts-expect-error Intentional schema change
    expect(redactor.redact(input)).toEqual({ metadata: { type: "Array", length: 2 } });
  });

  test("redact - array inside metadata", () => {
    const input = { metadata: { users: ["admin", "user"] } };

    // @ts-expect-error Intentional schema change
    expect(redactor.redact(input)).toEqual({ metadata: { users: { type: "Array", length: 2 } } });
  });

  test("redact - noop - not plain object", () => {
    const input = 5;

    expect(redactor.redact(input)).toEqual(input);
  });

  test("redact - noop - metadata property", () => {
    const input = { message: "message" };

    expect(redactor.redact(input)).toEqual(input);
  });

  test("redact - noop - metadata - not an array", () => {
    const input = { metadata: 5 };

    expect(redactor.redact(input)).toEqual(input);
  });

  test("redact - noop - metadata - no array inside", () => {
    const input = { metadata: { users: 1 } };

    expect(redactor.redact(input)).toEqual(input);
  });
});
