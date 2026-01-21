import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RedactorMetadataCompactObjectStrategy } from "../src/redactor-metadata-compact-object.strategy";

const redactor = new RedactorMetadataCompactObjectStrategy({ maxKeys: tools.IntegerPositive.parse(1) });

describe("RedactorMetadataCompactObjectStrategy", () => {
  test("redact", () => {
    expect(redactor.redact({ metadata: { admins: 1, users: 2 } })).toEqual({
      // @ts-expect-error Intentional schema change
      metadata: { type: "Object", keys: 2 },
    });
  });

  test("redact - nested", () => {
    expect(redactor.redact({ metadata: { users: { admins: 1, users: 2 } } })).toEqual({
      // @ts-expect-error Intentional schema change
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
