import { describe, expect, jest, spyOn, test } from "bun:test";
import { CacheRepositoryNoopAdapter } from "../src/cache-repository-noop.adapter";
import { CacheResolverSimpleAdapter } from "../src/cache-resolver-simple.adapter";
import * as mocks from "./mocks";

const cached = "cached-value";
const fresh = "fresh-value";

describe("CacheResolverSimpleAdapter", () => {
  test("success - hit", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const getSpy = spyOn(CacheRepository, "get").mockResolvedValue(cached);

    const result = await CacheResolver.resolve("key", async () => fresh);

    expect(result).toEqual(cached);
    expect(getSpy).toHaveBeenCalledWith("key");
  });

  test("success - miss", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const setSpy = spyOn(CacheRepository, "set");

    const result = await CacheResolver.resolve("key", async () => fresh);

    expect(result).toEqual(fresh);
    expect(setSpy).toHaveBeenCalledWith("key", fresh);
  });

  test("failure - error propagation", async () => {
    const CacheRepository = new CacheRepositoryNoopAdapter();
    const CacheResolver = new CacheResolverSimpleAdapter({ CacheRepository });
    const setSpy = spyOn(CacheRepository, "set");

    expect(async () =>
      CacheResolver.resolve("key", async () => {
        throw new Error(mocks.IntentialError);
      }),
    ).toThrow(mocks.IntentialError);
    expect(setSpy).not.toHaveBeenCalled();
  });
});
