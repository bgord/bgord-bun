import { describe, expect, test } from "bun:test";
import { Hash } from "../src/hash.vo";
import { IdempotencyStoreNoopAdapter } from "../src/idempotency-store-noop.adapter";

const adapter = new IdempotencyStoreNoopAdapter();

const primary = Hash.fromString("a".repeat(64));

describe("IdempotencyStoreNoopAdapter", () => {
  test("register - first time", async () => {
    expect(await adapter.register(primary)).toEqual(true);
  });

  test("register - replay", async () => {
    await adapter.register(primary);

    expect(await adapter.register(primary)).toEqual(true);
  });
});
