import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { StandardSchemaValidator } from "../src/standard-schema-validator.service";
import * as mocks from "./mocks";

const schema = v.object({ name: v.string() });
const name = "app";

describe("StandardSchemaValidator", () => {
  test("happy path", () => {
    expect(StandardSchemaValidator.validate(schema, { name })).toEqual({ name });
  });

  test("validation error", () => {
    expect(() => StandardSchemaValidator.validate(schema, { name: 123 })).toThrow();
  });

  test("async schema", () => {
    expect(() => StandardSchemaValidator.validate(mocks.asyncSchema, {})).toThrow(
      "standard.schema.validate.error.no.async.schema",
    );
  });

  test("thenable schema", () => {
    const thenable = {
      "~standard": {
        version: 1 as const,
        vendor: "test",
        // biome-ignore lint: lint/suspicious/noThenProperty
        validate: () => ({ then: () => {}, value: { name } }) as never,
      },
    };

    expect(() => StandardSchemaValidator.validate(thenable, {})).toThrow(
      "standard.schema.validate.error.no.async.schema",
    );
  });
});
