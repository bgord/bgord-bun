import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as z from "zod/v4";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectApplicationResolver } from "../src/cache-subject-application-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { EnvironmentLoaderProcessSafeAdapter } from "../src/environment-loader-process-safe.adapter";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { NodeEnvironmentEnum } from "../src/node-env.vo";

const Schema = z.object({ APP_NAME: z.string() });

const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl: tools.Duration.Hours(1) });

const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256BunStrategy();
const deps = { CacheResolver, HashContent };

describe("EnvironmentLoaderProcessSafe", () => {
  test("happy path", async () => {
    process.env.APP_NAME = "MyApp";

    const resolver = new CacheSubjectApplicationResolver([new CacheSubjectSegmentFixedStrategy("env")], {
      HashContent,
    });
    const subject = await resolver.resolve();
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      { ...process.env, APP_NAME: "MyApp" },
      { type: NodeEnvironmentEnum.local, Schema },
      deps,
    );
    const cacheResolverResolve = spyOn(CacheResolver, "resolve");

    const result = await adapter.load();

    expect(result.APP_NAME).toEqual("MyApp");
    expect(result.type).toEqual(NodeEnvironmentEnum.local);
    // @ts-expect-error Changed schema assertion
    expect(process.env.APP_NAME).toEqual(undefined);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(1, subject.hex, expect.any(Function));

    const second = await adapter.load();

    expect(second.APP_NAME).toEqual("MyApp");
    expect(second.type).toEqual(NodeEnvironmentEnum.local);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(2, subject.hex, expect.any(Function));

    await CacheResolver.flush();
  });

  test("failure", async () => {
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      // @ts-expect-error Changed schema assertion
      { ...process.env, APP_NAME: 123 },
      { type: "invalid", Schema },
      deps,
    );

    expect(async () => adapter.load()).toThrow();

    await CacheResolver.flush();
  });
});
