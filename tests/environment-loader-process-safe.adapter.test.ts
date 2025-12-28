import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { z } from "zod/v4";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { EnvironmentLoaderProcessSafeAdapter } from "../src/environment-loader-process-safe.adapter";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const Schema = z.object({ APP_NAME: z.string() });

const config = { ttl: tools.Duration.Hours(1) };
const CacheRepository = new CacheRepositoryNodeCacheAdapter(config);

const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256BunStrategy();
const deps = { CacheResolver, HashContent };

describe("EnvironmentLoaderProcessSafe", () => {
  test("happy path", async () => {
    process.env.APP_NAME = "MyApp";
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      { ...process.env, APP_NAME: "MyApp" },
      { type: NodeEnvironmentEnum.local, Schema },
      deps,
    );

    const result = await adapter.load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);
    // @ts-expect-error
    expect(process.env.APP_NAME).toEqual(undefined);

    const second = await adapter.load();

    expect(second.APP_NAME).toEqual("MyApp");
    expect(second.type).toEqual(NodeEnvironmentEnum.local);

    await CacheResolver.flush();
  });

  test("failure", async () => {
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      // @ts-expect-error
      { ...process.env, APP_NAME: 123 },
      { type: "invalid", Schema },
      deps,
    );

    expect(async () => adapter.load()).toThrow();

    await CacheResolver.flush();
  });
});
