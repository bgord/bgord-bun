import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectResolver } from "../src/cache-subject-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { FileReaderJsonWithCacheAdapter } from "../src/file-reader-json-with-cache.adapter";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";

const content = {};
const inner = new FileReaderJsonNoopAdapter(content);

const path = "package.json";
const relative = tools.FilePathRelative.fromString("project/package.json");

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
const HashContent = new HashContentSha256BunStrategy();
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const deps = { CacheResolver, HashContent };

const adapter = new FileReaderJsonWithCacheAdapter({ id: "json", inner }, deps);

describe("FileReaderJsonWithCacheAdapter", () => {
  test("happy path", async () => {
    jest.useFakeTimers();
    const innerRead = spyOn(inner, "read");
    const cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const resolver = new CacheSubjectResolver(
      [
        new CacheSubjectSegmentFixedStrategy("file_reader_json"),
        new CacheSubjectSegmentFixedStrategy("json"),
        new CacheSubjectSegmentFixedStrategy(path),
      ],
      deps,
    );
    const subject = await resolver.resolve();

    expect(await adapter.read(path)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve.mock.calls[0]?.[0]).toEqual(subject.hex);

    expect(await adapter.read(path)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve.mock.calls[1]?.[0]).toEqual(subject.hex);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.read(path)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(2);
    expect(cacheResolverResolve.mock.calls[2]?.[0]).toEqual(subject.hex);

    jest.useFakeTimers();
  });

  test("happy path - relative path", async () => {
    jest.useFakeTimers();
    const innerRead = spyOn(inner, "read");
    const cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const resolver = new CacheSubjectResolver(
      [
        new CacheSubjectSegmentFixedStrategy("file_reader_json"),
        new CacheSubjectSegmentFixedStrategy("json"),
        new CacheSubjectSegmentFixedStrategy(relative.get()),
      ],
      deps,
    );
    const subject = await resolver.resolve();

    expect(await adapter.read(relative)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve.mock.calls[0]?.[0]).toEqual(subject.hex);

    expect(await adapter.read(relative)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve.mock.calls[1]?.[0]).toEqual(subject.hex);

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.read(relative)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(2);
    expect(cacheResolverResolve.mock.calls[2]?.[0]).toEqual(subject.hex);

    jest.useFakeTimers();
  });
});
