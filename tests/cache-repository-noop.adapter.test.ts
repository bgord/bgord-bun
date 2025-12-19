import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNoopAdapter } from "../src/cache-repository-noop.adapter";

const config = { ttl: tools.Duration.Hours(1) };
const adapter = new CacheRepositoryNoopAdapter(config);

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

  test("ttl expiration", async () => {
    jest.useFakeTimers();

    await adapter.set();
    jest.advanceTimersByTime(config.ttl.add(tools.Duration.Seconds(1)).ms);

    expect(await adapter.get()).toEqual(null);

    jest.useRealTimers();
  });

  test("get ttl", async () => {
    expect(adapter.ttl).toEqual(config.ttl);
  });
});
