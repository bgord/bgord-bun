import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RedactorMetadataCompactStrategy } from "../src/redactor-metadata-compact.strategy";

const redactor = new RedactorMetadataCompactStrategy({ maxKeys: tools.IntegerPositive.parse(1) });

describe("RedactorMetadataCompactStrategy", () => {
  test("happy path", () => {
    expect(redactor.redact({ metadata: { admins: 1, users: 2 } })).toEqual({
      // @ts-expect-error
      metadata: { type: "Object", keys: 2 },
    });
  });

  test("happy path - nested", () => {
    expect(redactor.redact({ metadata: { users: { admins: 1, users: 2 } } })).toEqual({
      // @ts-expect-error
      metadata: { users: { type: "Object", keys: 2 } },
    });
  });

  test("noop - not plain object", () => {
    const input = 5;

    expect(redactor.redact(input)).toEqual(input);
  });

  test("noop - metadata property", () => {
    const input = { message: "message" };

    expect(redactor.redact(input)).toEqual(input);
  });

  test("noop - metadata - not plain object", () => {
    const input = { metadata: 5 };

    expect(redactor.redact(input)).toEqual(input);
  });
});
