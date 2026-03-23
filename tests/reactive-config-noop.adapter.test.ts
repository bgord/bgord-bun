import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import * as mocks from "./mocks";

const schema = v.object({ timeout: v.number("timeout.invalid"), label: v.string() });
const config = { timeout: 5000, label: "default" };
const adapter = new ReactiveConfigNoopAdapter(schema, config);

describe("ReactiveConfigNoopAdapter", () => {
  test("happy path", async () => {
    const result = await adapter.get();

    expect(result).toEqual(config);
    expect(Object.isFrozen(result)).toEqual(true);
  });

  test("failure - schema violation", async () => {
    const adapter = new ReactiveConfigNoopAdapter(
      schema,
      // @ts-expect-error intentional schema mismatch
      { timeout: "not-a-number", label: "default" },
    );

    expect(async () => adapter.get()).toThrow("timeout.invalid");
  });

  test("failure - async schema", async () => {
    // @ts-expect-error intentional schema mismatch
    const adapter = new ReactiveConfigNoopAdapter(mocks.asyncSchema, {});

    expect(async () => adapter.get()).toThrow("reactive.config.no.async.schema");
  });
});
