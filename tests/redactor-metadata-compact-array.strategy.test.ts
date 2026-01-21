import { describe, expect, test } from "bun:test";
import { RedactorMetadataCompactArrayStrategy } from "../src/redactor-metadata-compact-array.strategy";

const redactor = new RedactorMetadataCompactArrayStrategy();

describe("RedactorMetadataCompactArrayStrategy", () => {
  test("happy path - metadata array", () => {
    const input = { metadata: ["admin", "user"] };

    // @ts-expect-error
    expect(redactor.redact(input)).toEqual({ metadata: { type: "Array", length: 2 } });
  });

  test("happy path - array inside metadata", () => {
    const input = { metadata: { users: ["admin", "user"] } };

    // @ts-expect-error
    expect(redactor.redact(input)).toEqual({ metadata: { users: { type: "Array", length: 2 } } });
  });

  test("noop - not plain object", () => {
    const input = 5;

    expect(redactor.redact(input)).toEqual(input);
  });

  test("noop - metadata property", () => {
    const input = { message: "message" };

    expect(redactor.redact(input)).toEqual(input);
  });

  test("noop - metadata - not an array", () => {
    const input = { metadata: 5 };

    expect(redactor.redact(input)).toEqual(input);
  });

  test("noop - metadata - no array inside", () => {
    const input = { metadata: { users: 1 } };

    expect(redactor.redact(input)).toEqual(input);
  });
});
