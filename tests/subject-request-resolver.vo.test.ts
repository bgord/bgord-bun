import { describe, expect, test } from "bun:test";
import { Hash } from "../src/hash.vo";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentCookieStrategy } from "../src/subject-segment-cookie.strategy";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentHeaderStrategy } from "../src/subject-segment-header.strategy";
import { SubjectSegmentMethodStrategy } from "../src/subject-segment-method.strategy";
import { SubjectSegmentPathStrategy } from "../src/subject-segment-path.strategy";
import { SubjectSegmentQueryStrategy } from "../src/subject-segment-query.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const fixed = new SubjectSegmentFixedStrategy("response");
const method = new SubjectSegmentMethodStrategy();
const path = new SubjectSegmentPathStrategy();
const cookieLanguage = new SubjectSegmentCookieStrategy("language");
const headerAccept = new SubjectSegmentHeaderStrategy("accept");
const query = new SubjectSegmentQueryStrategy();
const user = new SubjectSegmentUserStrategy();

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

describe("SubjectRequestResolver", () => {
  test("fixed", async () => {
    const context = new RequestContextBuilder().build();

    const result = await new SubjectRequestResolver([fixed], deps).resolve(context);

    expect(result.raw).toEqual([["fixed", "response"]]);
    expect(result.hex).toEqual(
      Hash.fromString("2545e03d0b1c5c0e78b95be323eac3cc378ef9c5570ead3f1cfe872a220373ac"),
    );
  });

  test("fixed, method", async () => {
    const context = new RequestContextBuilder().withMethod("POST").build();

    const result = await new SubjectRequestResolver([fixed, method], deps).resolve(context);

    expect(result.raw).toEqual([
      ["fixed", "response"],
      ["method", "POST"],
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("c31f21e48b34e403ffbbb14d9ad84f86d75fb9475ef5c98288878ee26b6b6fe6"),
    );
  });

  test("fixed, method, path", async () => {
    const context = new RequestContextBuilder().withMethod("POST").withPath("/about").build();

    const result = await new SubjectRequestResolver([fixed, method, path], deps).resolve(context);

    expect(result.raw).toEqual([
      ["fixed", "response"],
      ["method", "POST"],
      ["path", "/about"],
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("48464f433b119f5b0ded641b33bbb3f2f9333e44f8b0fda543cc627f3823c4e0"),
    );
  });

  test("fixed, method, path, cookie language", async () => {
    const context = new RequestContextBuilder()
      .withMethod("POST")
      .withPath("/about")
      .withCookie("language", "en")
      .build();

    const result = await new SubjectRequestResolver([fixed, method, path, cookieLanguage], deps).resolve(
      context,
    );

    expect(result.raw).toEqual([
      ["fixed", "response"],
      ["method", "POST"],
      ["path", "/about"],
      ["cookie:language", "en"],
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("f3cb1c6b9a88d8c964429be92b0945b43eafc5b4b6c4f1b0da4d7d03d5147ce1"),
    );
  });

  test("fixed, method, path, cookie language, header accept", async () => {
    const context = new RequestContextBuilder()
      .withMethod("POST")
      .withPath("/about")
      .withCookie("language", "en")
      .withHeader("accept", "application/json")
      .build();

    const result = await new SubjectRequestResolver(
      [fixed, method, path, cookieLanguage, headerAccept],
      deps,
    ).resolve(context);

    expect(result.raw).toEqual([
      ["fixed", "response"],
      ["method", "POST"],
      ["path", "/about"],
      ["cookie:language", "en"],
      ["header:accept", "application/json"],
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("ac0eb135d26e496699332fbeb60e678a43a50eee42c115b8afce26439009a8c2"),
    );
  });

  test("fixed, method, path, cookie language, header accept, query", async () => {
    const context = new RequestContextBuilder()
      .withMethod("POST")
      .withPath("/about")
      .withCookie("language", "en")
      .withHeader("accept", "application/json")
      .withQuery({ aaa: "123", bbb: "234" })
      .build();

    const result = await new SubjectRequestResolver(
      [fixed, method, path, cookieLanguage, headerAccept, query],
      deps,
    ).resolve(context);

    expect(result.raw).toEqual([
      ["fixed", "response"],
      ["method", "POST"],
      ["path", "/about"],
      ["cookie:language", "en"],
      ["header:accept", "application/json"],
      ["query", `[["aaa",["123"]],["bbb",["234"]]]`],
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("0d9cfed53ebbeee9a87c29693424295629a13ddebd8d2a72044055a1e2091feb"),
    );
  });

  test("fixed, method, path, cookie language, header accept, query, user", async () => {
    const context = new RequestContextBuilder()
      .withMethod("POST")
      .withPath("/about")
      .withCookie("language", "en")
      .withHeader("accept", "application/json")
      .withQuery({ aaa: "123", bbb: "234" })
      .withUserId(mocks.userId)
      .build();

    const result = await new SubjectRequestResolver(
      [fixed, method, path, cookieLanguage, headerAccept, query, user],
      deps,
    ).resolve(context);

    expect(result.raw).toEqual([
      ["fixed", "response"],
      ["method", "POST"],
      ["path", "/about"],
      ["cookie:language", "en"],
      ["header:accept", "application/json"],
      ["query", `[["aaa",["123"]],["bbb",["234"]]]`],
      ["user", mocks.userId],
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("3ee7e33d0b116a08faf1000a284a95ed5d7e2466edb715f63c870b341135db0d"),
    );
  });

  test("segments - empty", async () => {
    const context = new RequestContextBuilder().build();

    expect(async () => new SubjectRequestResolver([], deps).resolve(context)).toThrow(
      "subject.request.no.segments",
    );
  });

  test("segments - too many", async () => {
    const context = new RequestContextBuilder().build();

    expect(async () =>
      new SubjectRequestResolver(
        [fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed],
        deps,
      ).resolve(context),
    ).toThrow("subject.request.too.many.segments");
  });

  test("segments - at the limit", async () => {
    const context = new RequestContextBuilder().build();

    expect(async () =>
      new SubjectRequestResolver(
        [fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed],
        deps,
      ).resolve(context),
    ).not.toThrow();
  });
});
