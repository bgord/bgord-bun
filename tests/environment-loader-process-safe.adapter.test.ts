import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { EnvironmentLoaderProcessSafeAdapter } from "../src/environment-loader-process-safe.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { NodeEnvironmentEnum } from "../src/node-env.vo";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as mocks from "./mocks";

const EnvironmentSchema = v.object({ APP_NAME: v.string("app.name.invalid") });

const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl: tools.Duration.Hours(1) });

const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const HashContent = new HashContentSha256Strategy();
const deps = { CacheResolver, HashContent };

describe("EnvironmentLoaderProcessSafe", () => {
  test("happy path", async () => {
    process.env["APP_NAME"] = "MyApp";

    const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("env")], {
      HashContent,
    });
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const subject = await resolver.resolve();
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      { ...process.env, APP_NAME: "MyApp" },
      { type: NodeEnvironmentEnum.local, EnvironmentSchema },
      deps,
    );

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
      { type: NodeEnvironmentEnum.local, EnvironmentSchema },
      deps,
    );

    expect(async () => adapter.load()).toThrow("app.name.invalid");

    await CacheResolver.flush();
  });

  test("failure - async schema", async () => {
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      { ...process.env, APP_NAME: "MyApp" },
      { type: NodeEnvironmentEnum.local, EnvironmentSchema: mocks.asyncSchema },
      deps,
    );

    expect(async () => adapter.load()).toThrow("environment.loader.no.async.schema");
  });
});
