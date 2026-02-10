import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { CacheSubjectApplicationResolver } from "../src/cache-subject-application-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { FileReaderTextNoopAdapter } from "../src/file-reader-text-noop.adapter";
import { FileReaderTextWithCacheAdapter } from "../src/file-reader-text-with-cache.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";

const content = "hello";
const inner = new FileReaderTextNoopAdapter(content);

const path = "package.txt";
const relative = tools.FilePathRelative.fromString("project/package.txt");
const absolute = tools.FilePathAbsolute.fromString("/project/package.txt");

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
const HashContent = new HashContentSha256Strategy();
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const deps = { CacheResolver, HashContent };

const adapter = new FileReaderTextWithCacheAdapter({ id: "text", inner }, deps);

describe("FileReaderTextWithCacheAdapter", () => {
  test("happy path", async () => {
    jest.useFakeTimers();
    using innerRead = spyOn(inner, "read");
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const resolver = new CacheSubjectApplicationResolver(
      [
        new CacheSubjectSegmentFixedStrategy("file_reader_text"),
        new CacheSubjectSegmentFixedStrategy("text"),
        new CacheSubjectSegmentFixedStrategy(path),
      ],
      deps,
    );
    const subject = await resolver.resolve();

    expect(await adapter.read(path)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(1, subject.hex, expect.any(Function));

    expect(await adapter.read(path)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(2, subject.hex, expect.any(Function));

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.read(path)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(2);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(3, subject.hex, expect.any(Function));

    jest.useFakeTimers();
  });

  test("happy path - relative path", async () => {
    jest.useFakeTimers();
    using innerRead = spyOn(inner, "read");
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const resolver = new CacheSubjectApplicationResolver(
      [
        new CacheSubjectSegmentFixedStrategy("file_reader_text"),
        new CacheSubjectSegmentFixedStrategy("text"),
        new CacheSubjectSegmentFixedStrategy(relative.get()),
      ],
      deps,
    );
    const subject = await resolver.resolve();

    expect(await adapter.read(relative)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(1, subject.hex, expect.any(Function));

    expect(await adapter.read(relative)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(2, subject.hex, expect.any(Function));

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.read(relative)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(2);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(3, subject.hex, expect.any(Function));

    jest.useFakeTimers();
  });

  test("happy path - absolute path", async () => {
    jest.useFakeTimers();
    using innerRead = spyOn(inner, "read");
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const resolver = new CacheSubjectApplicationResolver(
      [
        new CacheSubjectSegmentFixedStrategy("file_reader_text"),
        new CacheSubjectSegmentFixedStrategy("text"),
        new CacheSubjectSegmentFixedStrategy(absolute.get()),
      ],
      deps,
    );
    const subject = await resolver.resolve();

    expect(await adapter.read(absolute)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(1, subject.hex, expect.any(Function));

    expect(await adapter.read(absolute)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(1);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(2, subject.hex, expect.any(Function));

    jest.advanceTimersByTime(ttl.add(tools.Duration.MIN).ms);

    expect(await adapter.read(absolute)).toEqual(content);
    expect(innerRead).toHaveBeenCalledTimes(2);
    expect(cacheResolverResolve).toHaveBeenNthCalledWith(3, subject.hex, expect.any(Function));

    jest.useFakeTimers();
  });
});
