import { describe, expect, spyOn, test } from "bun:test";
import * as v from "valibot";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import { ReactiveConfigWithFallbackAdapter } from "../src/reactive-config-with-fallback.adapter";
import * as mocks from "./mocks";

const schema = v.object({ rate: v.number("rate.invalid") });
const config = { rate: 100 };
const fallback = { rate: 0 };

const inner = new ReactiveConfigNoopAdapter(schema, config);
const adapter = new ReactiveConfigWithFallbackAdapter(inner, schema, fallback);

describe("ReactiveConfigWithFallbackAdapter", () => {
  test("happy path", async () => {
    expect(await adapter.get()).toEqual(config);
  });

  test("fallback", async () => {
    using _ = spyOn(inner, "get").mockImplementation(mocks.throwIntentionalErrorAsync);

    const result = await adapter.get();

    expect(result).toEqual(fallback);
    expect(Object.isFrozen(result)).toEqual(true);
  });

  test("fallback failure - schema violation", async () => {
    using _ = spyOn(inner, "get").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new ReactiveConfigWithFallbackAdapter(
      inner,
      schema,
      // @ts-expect-error intentional schema mismatch
      { rate: "not-a-number" },
    );

    expect(async () => adapter.get()).toThrow("rate.invalid");
  });

  test("fallback failure - async schema", async () => {
    using _ = spyOn(inner, "get").mockImplementation(mocks.throwIntentionalErrorAsync);
    // @ts-expect-error intentional schema mismatch
    const adapter = new ReactiveConfigWithFallbackAdapter(inner, mocks.asyncSchema, {});

    expect(async () => adapter.get()).toThrow("reactive.config.no.async.schema");
  });
});
