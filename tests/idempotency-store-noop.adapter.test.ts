import { describe, expect, test } from "bun:test";
import { Hash } from "../src/hash.vo";
import { IdempotencyStoreNoopAdapter } from "../src/idempotency-store-noop.adapter";

const adapter = new IdempotencyStoreNoopAdapter();

const primary = Hash.fromString("a".repeat(64));

describe("IdempotencyStoreNoopAdapter", () => {
  test("claim - first time", async () => {
    expect(await adapter.claim(primary)).toEqual(true);
  });

  test("claim - replay", async () => {
    await adapter.claim(primary);

    expect(await adapter.claim(primary)).toEqual(true);
  });
});
