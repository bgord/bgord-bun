import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RedactorMetadataCompactObject } from "../src/redactor-metadata-compact-object.strategy";

const redactor = new RedactorMetadataCompactObject({ maxKeys: tools.IntegerPositive.parse(1) });

describe("RedactorMetadataCompactObject", () => {
  test("redact - default max keys", () => {
    const redactor = new RedactorMetadataCompactObject({ maxKeys: tools.IntegerPositive.parse(1) });

    const result = redactor.redact({
      metadata: Object.fromEntries(Array.from({ length: 21 }).map((_, index) => [`user_${index}`, true])),
    });

    // @ts-expect-error Changed schema assertion
    expect(result).toEqual({ metadata: { type: "Object", keys: 21 } });
  });

  test("redact", () => {
    expect(redactor.redact({ metadata: { admins: 1, users: 2 } })).toEqual({
      // @ts-expect-error Changed schema assertion
      metadata: { type: "Object", keys: 2 },
    });
  });

  test("redact - nested", () => {
    expect(redactor.redact({ metadata: { users: { admins: 1, users: 2 } } })).toEqual({
      // @ts-expect-error Changed schema assertion
      metadata: { users: { type: "Object", keys: 2 } },
    });
  });

  test("redact - noop - not plain object", () => {
    const input = 5;

    expect(redactor.redact(input)).toEqual(input);
  });

  test("redact - noop - metadata property", () => {
    const input = { message: "message" };

    expect(redactor.redact(input)).toEqual(input);
  });

  test("redact - noop - metadata - not plain object", () => {
    const input = { metadata: 5 };

    expect(redactor.redact(input)).toEqual(input);
  });
});
