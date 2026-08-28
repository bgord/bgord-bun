import { describe, expect, test } from "bun:test";
import { CacheCodecIdentityStrategy } from "../src/cache-codec-identity.strategy";
import { CacheResolverNoopStrategy } from "../src/cache-resolver-noop.strategy";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import * as mocks from "./mocks";

const first = "first-value";
const second = "second-value";

const HashContent = new HashContentSha256Strategy();
const codec = new CacheCodecIdentityStrategy<string>();
const deps = { HashContent };

describe("CacheResolverNoopStrategy", async () => {
  const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("key")], deps);
  const subject = await resolver.resolve();

  test("success - hit", async () => {
    const CacheResolver = new CacheResolverNoopStrategy();

    expect(await CacheResolver.resolve(subject.hex, async () => first, codec)).toEqual(first);
  });

  test("failure - error propagation", async () => {
    const CacheResolver = new CacheResolverNoopStrategy();

    expect(async () => CacheResolver.resolve(subject.hex, mocks.throwIntentionalErrorAsync, codec)).toThrow(
      mocks.IntentionalError,
    );
  });

  test("flush", async () => {
    const CacheResolver = new CacheResolverNoopStrategy();

    expect(await CacheResolver.flush()).toEqual(undefined);
  });
});
