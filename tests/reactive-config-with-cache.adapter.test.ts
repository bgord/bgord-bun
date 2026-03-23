import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { ReactiveConfigFileJsonAdapter } from "../src/reactive-config-file-json.adapter";
import { ReactiveConfigWithCacheAdapter } from "../src/reactive-config-with-cache.adapter";

const schema = v.object({ threshold: v.number() });
const config = { threshold: 42 };
const path = tools.FilePathRelative.fromString("config/limits.json");

const FileReaderJson = new FileReaderJsonNoopAdapter(config);
const inner = new ReactiveConfigFileJsonAdapter(path, schema, { FileReaderJson });

const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl: tools.Duration.Hours(1) });
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const deps = { CacheResolver, HashContent };

describe("ReactiveConfigWithCacheAdapter", () => {
  test("happy path", async () => {
    const adapter = new ReactiveConfigWithCacheAdapter(inner, "limits", deps);

    expect(await adapter.get()).toEqual({ threshold: 42 });

    await CacheResolver.flush();
  });

  test("re-reads", async () => {
    using read = spyOn(FileReaderJson, "read");
    const adapter = new ReactiveConfigWithCacheAdapter(inner, "limits", deps);

    await adapter.get();
    await adapter.get();

    expect(read).toHaveBeenCalledTimes(1);

    await CacheResolver.flush();
  });

  test("independence", async () => {
    using read = spyOn(FileReaderJson, "read");
    const adapterA = new ReactiveConfigWithCacheAdapter(inner, "subject-a", deps);
    const adapterB = new ReactiveConfigWithCacheAdapter(inner, "subject-b", deps);

    await adapterA.get();
    await adapterB.get();

    expect(read).toHaveBeenCalledTimes(2);

    await CacheResolver.flush();
  });
});
