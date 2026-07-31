import { describe, expect, test } from "bun:test";
import { Hash } from "../src/hash.vo";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentCookieStrategy } from "../src/subject-segment-cookie.strategy";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
import { SubjectSegmentMethodStrategy } from "../src/subject-segment-method.strategy";
import { SubjectSegmentHeaderStrategy } from "../src/subject-segment-header.strategy";
import { SubjectSegmentPathStrategy } from "../src/subject-segment-path.strategy";
import { SubjectSegmentQueryStrategy } from "../src/subject-segment-query.strategy";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
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

    expect(result.raw).toEqual(["response"]);
    expect(result.hex).toEqual(
      Hash.fromString("d26d4f55806083f067207948ce977e0ae3d5e84df796d58441909de2c247c170"),
    );
  });

  test("fixed, method", async () => {
    const context = new RequestContextBuilder().withMethod("POST").build();

    const result = await new SubjectRequestResolver([fixed, method], deps).resolve(context);

    expect(result.raw).toEqual(["response", "POST"]);
    expect(result.hex).toEqual(
      Hash.fromString("89f21a1c6fe4d18c052da73daca5c15bef0cda7af5339622e76dc6210773dec0"),
    );
  });

  test("fixed, method, path", async () => {
    const context = new RequestContextBuilder().withMethod("POST").withPath("/about").build();

    const result = await new SubjectRequestResolver([fixed, method, path], deps).resolve(context);

    expect(result.raw).toEqual(["response", "POST", "/about"]);
    expect(result.hex).toEqual(
      Hash.fromString("7f2092678cd226cad93065c8a07d277422b473a39d62d5cd1a88fc577854d97a"),
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

    expect(result.raw).toEqual(["response", "POST", "/about", "en"]);
    expect(result.hex).toEqual(
      Hash.fromString("db78668c2d2f6b781ec24ab7dc8b4b956437f8b6c19b0644f6c237606601615b"),
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

    expect(result.raw).toEqual(["response", "POST", "/about", "en", "application/json"]);
    expect(result.hex).toEqual(
      Hash.fromString("33997b29733cfc972972c8ffebb28c0aeb1c6aec658eaa63aa289e4d57006b61"),
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

    expect(result.raw).toEqual(["response", "POST", "/about", "en", "application/json", "aaa=123&bbb=234"]);
    expect(result.hex).toEqual(
      Hash.fromString("45c3813f8b1ff7e3f714424446ee25963b62c2a0109c37e7b631bdd8d04e741d"),
    );
  });

  test("fixed, method, path, cookie language, header accept, query, user", async () => {
    const context = new RequestContextBuilder()
      .withMethod("POST")
      .withPath("/about")
      .withCookie("language", "en")
      .withHeader("accept", "application/json")
      .withQuery({ aaa: "123", bbb: "234" })
      .withUserId("123456789")
      .build();

    const result = await new SubjectRequestResolver(
      [fixed, method, path, cookieLanguage, headerAccept, query, user],
      deps,
    ).resolve(context);

    expect(result.raw).toEqual([
      "response",
      "POST",
      "/about",
      "en",
      "application/json",
      "aaa=123&bbb=234",
      "123456789",
    ]);
    expect(result.hex).toEqual(
      Hash.fromString("59f2081f71598edef7f995dae6aa4b43ef7fec5abc20bab7f2928af9b1065730"),
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
