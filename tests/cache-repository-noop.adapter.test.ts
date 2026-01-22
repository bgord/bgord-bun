import { describe, expect, test } from "bun:test";
import { CacheRepositoryNoopAdapter } from "../src/cache-repository-noop.adapter";

const adapter = new CacheRepositoryNoopAdapter();

describe("CacheRepositoryNoopAdapter", async () => {
  test("get - null", async () => {
    expect(await adapter.get()).toEqual(null);
  });

  test("get - value", async () => {
    await adapter.set();

    expect(await adapter.get<string>()).toEqual(null);
  });

  test("delete", async () => {
    await adapter.set();

    expect(await adapter.get<string>()).toEqual(null);

    await adapter.delete();

    expect(await adapter.get()).toEqual(null);
  });

  test("flush", async () => {
    await adapter.set();
    await adapter.flush();

    expect(await adapter.get()).toEqual(null);
  });
});
