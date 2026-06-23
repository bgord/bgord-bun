import { describe, expect, test } from "bun:test";
import { Hash } from "../src/hash.vo";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentCookieStrategy } from "../src/subject-segment-cookie.strategy";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentHeaderStrategy } from "../src/subject-segment-header.strategy";
import { SubjectSegmentPathStrategy } from "../src/subject-segment-path.strategy";
import { SubjectSegmentQueryStrategy } from "../src/subject-segment-query.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const fixed = new SubjectSegmentFixedStrategy("response");
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

    expect(result.raw).toEqual(["response"]);
    expect(result.hex).toEqual(
      Hash.fromString("d26d4f55806083f067207948ce977e0ae3d5e84df796d58441909de2c247c170"),
    );
  });

  test("fixed, path", async () => {
    const context = new RequestContextBuilder().withPath("/about").build();

    const result = await new SubjectRequestResolver([fixed, path], deps).resolve(context);

    expect(result.raw).toEqual(["response", "/about"]);
    expect(result.hex).toEqual(
      Hash.fromString("7411c4fc5467f3272ba5d21f57ab3139b24256ec8ea0acc0ee6db1d92a00917f"),
    );
  });

  test("fixed, path, cookie language", async () => {
    const context = new RequestContextBuilder().withPath("/about").withCookie("language", "en").build();

    const result = await new SubjectRequestResolver([fixed, path, cookieLanguage], deps).resolve(context);

    expect(result.raw).toEqual(["response", "/about", "en"]);
    expect(result.hex).toEqual(
      Hash.fromString("b1d1b44511add0850768ec6084f40c6f52b464b312f413009103795dcabb3cf7"),
    );
  });

  test("fixed, path, cookie language, header accept", async () => {
    const context = new RequestContextBuilder()
      .withPath("/about")
      .withCookie("language", "en")
      .withHeader("accept", "application/json")
      .build();

    const result = await new SubjectRequestResolver(
      [fixed, path, cookieLanguage, headerAccept],
      deps,
    ).resolve(context);

    expect(result.raw).toEqual(["response", "/about", "en", "application/json"]);
    expect(result.hex).toEqual(
      Hash.fromString("ddedc400730fcaedfa0196ca8519b24b212cd1353a8f577e599dc58d27435a5a"),
    );
  });

  test("fixed, path, cookie language, header accept, query", async () => {
    const context = new RequestContextBuilder()
      .withPath("/about")
      .withCookie("language", "en")
      .withHeader("accept", "application/json")
      .withQuery({ aaa: "123", bbb: "234" })
      .build();

    const result = await new SubjectRequestResolver(
      [fixed, path, cookieLanguage, headerAccept, query],
      deps,
    ).resolve(context);

    expect(result.raw).toEqual(["response", "/about", "en", "application/json", "aaa=123&bbb=234"]);
    expect(result.hex).toEqual(
      Hash.fromString("128cec94f30ca49cbda9596113a1f475d293b25886f6de09c28ae536e50d72ad"),
    );
  });

  test("fixed, path, cookie language, header accept, query, user", async () => {
    const context = new RequestContextBuilder()
      .withPath("/about")
      .withCookie("language", "en")
      .withHeader("accept", "application/json")
      .withQuery({ aaa: "123", bbb: "234" })
      .withUserId("123456789")
      .build();

    const result = await new SubjectRequestResolver(
      [fixed, path, cookieLanguage, headerAccept, query, user],
      deps,
    ).resolve(context);

    expect(result.raw).toEqual([
      "response",
      "/about",
      "en",
      "application/json",
      "aaa=123&bbb=234",
      "123456789",
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("204dfc68878f8072be6a6dc463cfd4fa01387ed4788a0f26128280cc6d9a6fc2"),
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
