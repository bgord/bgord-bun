import { describe, expect, test } from "bun:test";
import { CacheSubjectRequestResolver } from "../src/cache-subject-request-resolver.vo";
import { CacheSubjectSegmentCookieStrategy } from "../src/cache-subject-segment-cookie.strategy";
import { CacheSubjectSegmentFixedStrategy } from "../src/cache-subject-segment-fixed.strategy";
import { CacheSubjectSegmentHeaderStrategy } from "../src/cache-subject-segment-header.strategy";
import { CacheSubjectSegmentPathStrategy } from "../src/cache-subject-segment-path.strategy";
import { CacheSubjectSegmentQueryStrategy } from "../src/cache-subject-segment-query.strategy";
import { CacheSubjectSegmentRequestEmpty } from "../src/cache-subject-segment-request.strategy";
import { CacheSubjectSegmentUserStrategy } from "../src/cache-subject-segment-user.strategy";
import { Hash } from "../src/hash.vo";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";

const fixed = new CacheSubjectSegmentFixedStrategy("response");
const path = new CacheSubjectSegmentPathStrategy();
const cookieLanguage = new CacheSubjectSegmentCookieStrategy("language");
const headerAccept = new CacheSubjectSegmentHeaderStrategy("accept");
const query = new CacheSubjectSegmentQueryStrategy();
const user = new CacheSubjectSegmentUserStrategy();

const HashContent = new HashContentSha256BunStrategy();
const deps = { HashContent };

describe("CacheSubjectResolver VO", () => {
  test("fixed", async () => {
    const context = {};

    const result = await new CacheSubjectRequestResolver([fixed], deps).resolve(context as any);

    expect(result.raw).toEqual(["response"]);
    expect(result.hex).toEqual(
      Hash.fromString("a9f4b3d22a523fdada41c85c175425bcd15b32b4cd0f54d9433accd52d7195a1"),
    );
  });

  test("fixed, path", async () => {
    const context = { req: { path: "/about", raw: { headers: new Headers({ cookie: "language=en" }) } } };

    const result = await new CacheSubjectRequestResolver([fixed, path], deps).resolve(context as any);

    expect(result.raw).toEqual(["response", "/about"]);
    expect(result.hex).toEqual(
      Hash.fromString("f762d6b7acf6b55b4a918eb367c488c1ae06104717b26b2ab7f2253b08240a25"),
    );
  });

  test("fixed, path, cookie language", async () => {
    const context = { req: { path: "/about", raw: { headers: new Headers({ cookie: "language=en" }) } } };

    const result = await new CacheSubjectRequestResolver([fixed, path, cookieLanguage], deps).resolve(
      context as any,
    );

    expect(result.raw).toEqual(["response", "/about", "en"]);
    expect(result.hex).toEqual(
      Hash.fromString("700ea2f37779cf5274fd0439ba7d0726572da1084d84c44fe42a9664c9bd0d79"),
    );
  });

  test("fixed, path, cookie language, header accept", async () => {
    const context = {
      req: {
        header: () => "application/json",
        path: "/about",
        raw: { headers: new Headers({ cookie: "language=en" }) },
      },
    };

    const result = await new CacheSubjectRequestResolver(
      [fixed, path, cookieLanguage, headerAccept],
      deps,
    ).resolve(context as any);

    expect(result.raw).toEqual(["response", "/about", "en", "application/json"]);
    expect(result.hex).toEqual(
      Hash.fromString("0cbd18c1c26a8fce0f083ad89d00d39bdb764f15611fbf0a9d644ac4c70cc2ec"),
    );
  });

  test("fixed, path, cookie language, header accept, query", async () => {
    const context = {
      req: {
        query: () => ({ aaa: "123", bbb: "234" }),
        header: () => "application/json",
        path: "/about",
        raw: { headers: new Headers({ cookie: "language=en" }) },
      },
    };

    const result = await new CacheSubjectRequestResolver(
      [fixed, path, cookieLanguage, headerAccept, query],
      deps,
    ).resolve(context as any);

    expect(result.raw).toEqual(["response", "/about", "en", "application/json", "aaa=123&bbb=234"]);
    expect(result.hex).toEqual(
      Hash.fromString("52085fa9b342b7c6442fdfc8f8513aa0e2916807ba60ae45f5fffd987e33593d"),
    );
  });

  test("fixed, path, cookie language, header accept, query, user", async () => {
    const context = {
      get: () => ({ id: "123456789" }),
      req: {
        query: () => ({ aaa: "123", bbb: "234" }),
        header: () => "application/json",
        path: "/about",
        raw: { headers: new Headers({ cookie: "language=en" }) },
      },
    };

    const result = await new CacheSubjectRequestResolver(
      [fixed, path, cookieLanguage, headerAccept, query, user],
      deps,
    ).resolve(context as any);

    expect(result.raw).toEqual([
      "response",
      "/about",
      "en",
      "application/json",
      "aaa=123&bbb=234",
      "123456789",
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("0a444aa132ac3d1f3e28ec59b0cd7ecdf89b432529698b4c0ba31c2ece9537e5"),
    );
  });

  test("segments - empty", async () => {
    const context = {};

    expect(async () => new CacheSubjectRequestResolver([], deps).resolve(context as any)).toThrow(
      "cache.subject.no.segments",
    );
  });

  test("segments - too many", async () => {
    const context = {};

    expect(async () =>
      new CacheSubjectRequestResolver(
        [fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed],
        deps,
      ).resolve(context as any),
    ).toThrow("cache.subject.too.many.segments");
  });

  test("segments - at the limit", async () => {
    const context = {};

    expect(async () =>
      new CacheSubjectRequestResolver(
        [fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed],
        deps,
      ).resolve(context as any),
    ).not.toThrow();
  });

  test("no context", async () => {
    const result = await new CacheSubjectRequestResolver(
      [fixed, path, cookieLanguage, headerAccept, query, user],
      deps,
    ).resolve({} as any);

    expect(result.raw).toEqual([
      "response",
      CacheSubjectSegmentRequestEmpty,
      CacheSubjectSegmentRequestEmpty,
      CacheSubjectSegmentRequestEmpty,
      CacheSubjectSegmentRequestEmpty,
      "anon",
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("a6e698b59ac4d42e768c76043c6dce60fe5f58ae7d25859c91f48d1d6b1e0a27"),
    );
  });

  test("sanitization", async () => {
    const context = {};
    const fixed = new CacheSubjectSegmentFixedStrategy("a|b|c|");

    const result = await new CacheSubjectRequestResolver([fixed], deps).resolve(context as any);

    expect(result.raw).toEqual(["a%7Cb%7Cc%7C"]);
    expect(result.hex).toEqual(
      Hash.fromString("8525434b92846688a55d7bd14ae4fb3d2bb7650b77c3d69f87eb8f4fb5683068"),
    );
  });
});
