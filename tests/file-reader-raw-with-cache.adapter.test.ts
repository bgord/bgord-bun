import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CacheRepositoryNodeCacheAdapter } from "../src/cache-repository-node-cache.adapter";
import { CacheResolverSimpleStrategy } from "../src/cache-resolver-simple.strategy";
import { FileReaderRawNoopAdapter } from "../src/file-reader-raw-noop.adapter";
import { FileReaderRawWithCacheAdapter } from "../src/file-reader-raw-with-cache.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";

const content = new TextEncoder().encode("hello").buffer;
const inner = new FileReaderRawNoopAdapter(content);

const path = "package.txt";
const relative = tools.FilePathRelative.fromString("project/package.txt");
const absolute = tools.FilePathAbsolute.fromString("/project/package.txt");

const ttl = tools.Duration.Minutes(1);
const CacheRepository = new CacheRepositoryNodeCacheAdapter({ type: "finite", ttl });
const HashContent = new HashContentSha256Strategy();
const CacheResolver = new CacheResolverSimpleStrategy({ CacheRepository });
const deps = { CacheResolver, HashContent };

const adapter = new FileReaderRawWithCacheAdapter({ id: "raw", inner }, deps);

describe("FileReaderRawWithCacheAdapter", () => {
  test("happy path", async () => {
    jest.useFakeTimers();
    using innerRead = spyOn(inner, "read");
    using cacheResolverResolve = spyOn(CacheResolver, "resolve");
    const resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("file_reader_raw"),
        new SubjectSegmentFixedStrategy("raw"),
        new SubjectSegmentFixedStrategy(path),
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
    const resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("file_reader_raw"),
        new SubjectSegmentFixedStrategy("raw"),
        new SubjectSegmentFixedStrategy(relative.get()),
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
    const resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("file_reader_raw"),
        new SubjectSegmentFixedStrategy("raw"),
        new SubjectSegmentFixedStrategy(absolute.get()),
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
