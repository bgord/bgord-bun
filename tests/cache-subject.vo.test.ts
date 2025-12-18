import { describe, expect, test } from "bun:test";
import { CacheSubject, CacheSubjectError } from "../src/cache-subject.vo";
import { CacheSubjectSegmentCookie } from "../src/cache-subject-segment-cookie";
import { CacheSubjectSegmentFixed } from "../src/cache-subject-segment-fixed";
import { CacheSubjectSegmentHeader } from "../src/cache-subject-segment-header";
import { CacheSubjectSegmentPath } from "../src/cache-subject-segment-path";
import { CacheSubjectSegmentQuery } from "../src/cache-subject-segment-query";
import { CacheSubjectSegmentUser } from "../src/cache-subject-segment-user";

const fixed = new CacheSubjectSegmentFixed("response");
const path = new CacheSubjectSegmentPath();
const cookieLanguage = new CacheSubjectSegmentCookie("language");
const headerAccept = new CacheSubjectSegmentHeader("accept");
const query = new CacheSubjectSegmentQuery();
const user = new CacheSubjectSegmentUser();

describe("CacheSubject", () => {
  test("fixed", () => {
    const context = {};

    const result = new CacheSubject([fixed]).resolve(context as any);

    expect(result.raw).toEqual(["response"]);
    expect(result.hex).toEqual("a9f4b3d22a523fdada41c85c175425bcd15b32b4cd0f54d9433accd52d7195a1");
  });

  test("fixed, path", () => {
    const context = { req: { path: "/about", raw: { headers: new Headers({ cookie: "language=en" }) } } };

    const result = new CacheSubject([fixed, path]).resolve(context as any);

    expect(result.raw).toEqual(["response", "/about"]);
    expect(result.hex).toEqual("f762d6b7acf6b55b4a918eb367c488c1ae06104717b26b2ab7f2253b08240a25");
  });

  test("fixed, path, cookie language", () => {
    const context = { req: { path: "/about", raw: { headers: new Headers({ cookie: "language=en" }) } } };

    const result = new CacheSubject([fixed, path, cookieLanguage]).resolve(context as any);

    expect(result.raw).toEqual(["response", "/about", "en"]);
    expect(result.hex).toEqual("700ea2f37779cf5274fd0439ba7d0726572da1084d84c44fe42a9664c9bd0d79");
  });

  test("fixed, path, cookie language, header accept", () => {
    const context = {
      req: {
        header: () => "application/json",
        path: "/about",
        raw: { headers: new Headers({ cookie: "language=en" }) },
      },
    };

    const result = new CacheSubject([fixed, path, cookieLanguage, headerAccept]).resolve(context as any);

    expect(result.raw).toEqual(["response", "/about", "en", "application/json"]);
    expect(result.hex).toEqual("0cbd18c1c26a8fce0f083ad89d00d39bdb764f15611fbf0a9d644ac4c70cc2ec");
  });

  test("fixed, path, cookie language, header accept, query", () => {
    const context = {
      req: {
        query: () => ({ aaa: "123", bbb: "234" }),
        header: () => "application/json",
        path: "/about",
        raw: { headers: new Headers({ cookie: "language=en" }) },
      },
    };

    const result = new CacheSubject([fixed, path, cookieLanguage, headerAccept, query]).resolve(
      context as any,
    );

    expect(result.raw).toEqual(["response", "/about", "en", "application/json", "aaa=123&bbb=234"]);
    expect(result.hex).toEqual("52085fa9b342b7c6442fdfc8f8513aa0e2916807ba60ae45f5fffd987e33593d");
  });

  test("fixed, path, cookie language, header accept, query, user", () => {
    const context = {
      get: () => ({ id: "123456789" }),
      req: {
        query: () => ({ aaa: "123", bbb: "234" }),
        header: () => "application/json",
        path: "/about",
        raw: { headers: new Headers({ cookie: "language=en" }) },
      },
    };

    const result = new CacheSubject([fixed, path, cookieLanguage, headerAccept, query, user]).resolve(
      context as any,
    );

    expect(result.raw).toEqual([
      "response",
      "/about",
      "en",
      "application/json",
      "aaa=123&bbb=234",
      "123456789",
    ]);
    expect(result.hex).toEqual("0a444aa132ac3d1f3e28ec59b0cd7ecdf89b432529698b4c0ba31c2ece9537e5");
  });

  test("NoSegments", () => {
    const context = {};

    expect(() => new CacheSubject([]).resolve(context as any)).toThrow(CacheSubjectError.NoSegments);
  });

  test("sanitization", () => {
    const context = {};
    const fixed = new CacheSubjectSegmentFixed("a|b|c|");

    const result = new CacheSubject([fixed]).resolve(context as any);

    expect(result.raw).toEqual(["a%7Cb%7Cc%7C"]);
    expect(result.hex).toEqual("8525434b92846688a55d7bd14ae4fb3d2bb7650b77c3d69f87eb8f4fb5683068");
  });
});
