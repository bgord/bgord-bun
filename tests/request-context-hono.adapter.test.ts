import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { ETagExtractorHeaderStrategy } from "../src/etag-extractor-header.strategy";
import { ETagExtractorHonoMiddleware } from "../src/etag-extractor-hono.middleware";
import { LanguageDetectorHeaderStrategy } from "../src/language-detector-header.strategy";
import { LanguageDetectorHonoMiddleware } from "../src/language-detector-hono.middleware";
import { RequestContextHonoAdapter } from "../src/request-context-hono.adapter";
import { TimeZoneOffsetMiddleware } from "../src/time-zone-offset.middleware";
import { TimeZoneOffsetHonoMiddleware } from "../src/time-zone-offset-hono.middleware";
import { WeakETagExtractorHeaderStrategy } from "../src/weak-etag-extractor-header.strategy";
import { WeakETagExtractorHonoMiddleware } from "../src/weak-etag-extractor-hono.middleware";
import * as mocks from "./mocks";

type Config = { Variables: { user: { id: number } } };

describe("RequestContextHonoAdapter", () => {
  test("path", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ path: new RequestContextHonoAdapter(context).request.path }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ path: "/test" });
  });

  test("method", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ method: new RequestContextHonoAdapter(context).request.method }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ method: "GET" });
  });

  test("url", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ url: new RequestContextHonoAdapter(context).request.url() }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ url: "http://localhost/test" });
  });

  test("header", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ header: new RequestContextHonoAdapter(context).request.header("accept") }),
    );

    const response = await app.request("/test", { headers: { accept: "application/json" } });

    expect(await response.json()).toEqual({ header: "application/json" });
  });

  test("headers", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ headers: new RequestContextHonoAdapter(context).request.headers() }),
    );

    const response = await app.request("/test", { headers: { accept: "application/json" } });

    expect(await response.json()).toEqual({ headers: new Headers({ accept: "application/json" }).toJSON() });
  });

  test("headersObject", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ headersObject: new RequestContextHonoAdapter(context).request.headersObject() }),
    );

    const response = await app.request("/test", { headers: { accept: "application/json" } });

    expect(await response.json()).toEqual({ headersObject: { accept: "application/json" } });
  });

  test("query", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ query: new RequestContextHonoAdapter(context).request.query() }),
    );

    const response = await app.request("/test?aaa=123&bbb=234");

    expect(await response.json()).toEqual({ query: { aaa: "123", bbb: "234" } });
  });

  test("queries", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ queries: new RequestContextHonoAdapter(context).request.queries() }),
    );

    const response = await app.request("/test?aaa=123&aaa=234");

    expect(await response.json()).toEqual({ queries: { aaa: ["123", "234"] } });
  });

  test("params", async () => {
    const app = new Hono().get("/test/:id/:context", (context) =>
      Response.json({ params: new RequestContextHonoAdapter(context).request.params() }),
    );

    const response = await app.request("/test/123/234");

    expect(await response.json()).toEqual({ params: { id: "123", context: "234" } });
  });

  test("param", async () => {
    const app = new Hono().get("/test/:id/:context", (context) =>
      Response.json({ param: new RequestContextHonoAdapter(context).request.param("id") }),
    );

    const response = await app.request("/test/123/234");

    expect(await response.json()).toEqual({ param: "123" });
  });

  test("cookie", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ language: new RequestContextHonoAdapter(context).request.cookie("language") }),
    );

    const response = await app.request("/test", { headers: { cookie: "language=en" } });

    expect(await response.json()).toEqual({ language: "en" });
  });

  test("json", async () => {
    const app = new Hono().post("/test", async (context) =>
      Response.json(await new RequestContextHonoAdapter(context).request.json()),
    );

    const response = await app.request("/test", {
      method: "POST",
      body: JSON.stringify({ reference: "abc" }),
    });

    expect(await response.json()).toEqual({ reference: "abc" });
  });

  test("json – invalid", async () => {
    const app = new Hono().post("/", async (context) =>
      Response.json(await new RequestContextHonoAdapter(context).request.json()),
    );

    const response = await app.request("http://localhost/", { method: "POST", body: "{ invalid json" });

    expect(await response.json()).toEqual({});
  });

  test("text", async () => {
    const app = new Hono().post("/test", async (context) =>
      Response.json({ text: await new RequestContextHonoAdapter(context).request.text() }),
    );

    const response = await app.request("/test", { method: "POST", body: "abc" });

    expect(await response.json()).toEqual({ text: "abc" });
  });

  test("text - empty", async () => {
    const app = new Hono().post("/test", async (context) =>
      Response.json({ text: await new RequestContextHonoAdapter(context).request.text() }),
    );

    const response = await app.request("/test", { method: "POST" });

    expect(await response.json()).toEqual({ text: "" });
  });

  test("form", async () => {
    const app = new Hono().post("/test", async (context) =>
      Response.json({
        name: (await new RequestContextHonoAdapter(context).request.form()).get("name"),
      }),
    );

    const form = new FormData();
    form.append("name", "abc");

    const response = await app.request("/test", { method: "POST", body: form });

    expect(await response.json()).toEqual({ name: "abc" });
  });

  test("form - invalid", async () => {
    const app = new Hono().post("/test", async (context) => {
      const form = await new RequestContextHonoAdapter(context).request.form();
      return Response.json({ size: [...form.entries()].length });
    });

    const response = await app.request("/test", {
      method: "POST",
      headers: { "content-type": "multipart/form-data" },
      body: "invalid",
    });

    expect(await response.json()).toEqual({ size: 0 });
  });

  test("userId", async () => {
    const app = new Hono<Config>().get(
      "/test",
      async (context, next) => {
        // @ts-expect-error
        context.set("user", { id: mocks.user.id });
        await next();
      },
      (context) => Response.json({ userId: new RequestContextHonoAdapter(context).identity.userId() }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ userId: mocks.userId });
  });

  test("authenticatedUserId - authenticated user", async () => {
    const app = new Hono<Config>().get(
      "/test",
      async (context, next) => {
        // @ts-expect-error
        context.set("user", { id: mocks.user.id });
        await next();
      },
      (context) =>
        Response.json({ userId: new RequestContextHonoAdapter(context).identity.authenticatedUserId() }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ userId: mocks.userId });
  });

  test("authenticatedUserId - guest user", async () => {
    const app = new Hono<Config>().get(
      "/test",
      async (context, next) => {
        // @ts-expect-error
        context.set("user", null);
        await next();
      },
      (context) =>
        Response.json({ userId: new RequestContextHonoAdapter(context).identity.authenticatedUserId() }),
    );

    const response = await app.request("/test");

    expect(response.status).toEqual(401);
    expect(await response.text()).toEqual("shield.auth.rejected");
  });

  test("authenticatedUserId - not attached", async () => {
    const app = new Hono<Config>().get("/test", (context) =>
      Response.json({ userId: new RequestContextHonoAdapter(context).identity.authenticatedUserId() }),
    );

    const response = await app.request("/test");

    expect(response.status).toEqual(500);
  });

  test("ip - x-real-ip", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ ip: new RequestContextHonoAdapter(context).identity.ip() }),
    );

    const response = await app.request("/test", { headers: { "x-real-ip": "127.0.0.1" } });

    expect(await response.json()).toEqual({ ip: "127.0.0.1" });
  });

  test("ip - x-forwarded-for - single", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ ip: new RequestContextHonoAdapter(context).identity.ip() }),
    );

    const response = await app.request("/test", { headers: { "x-forwarded-for": "10.0.0.1" } });

    expect(await response.json()).toEqual({ ip: "10.0.0.1" });
  });

  test("ip - x-forwarded-for - multi", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ ip: new RequestContextHonoAdapter(context).identity.ip() }),
    );

    const response = await app.request("/test", { headers: { "x-forwarded-for": "10.0.0.1 ,10.0.0.2" } });

    expect(await response.json()).toEqual({ ip: "10.0.0.1" });
  });

  test("ip - getConnInfo", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ ip: new RequestContextHonoAdapter(context).identity.ip() }),
    );

    const response = await app.request("/test", {}, mocks.connInfo);

    expect(await response.json()).toEqual({ ip: "127.0.0.1" });
  });

  test("remoteIp", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ remoteIp: new RequestContextHonoAdapter(context).identity.remoteIp() }),
    );

    const response = await app.request("/test", {}, mocks.connInfo);

    expect(await response.json()).toEqual({ remoteIp: "127.0.0.1" });
  });

  test("ua", async () => {
    const app = new Hono().get("/test", (context) =>
      Response.json({ ua: new RequestContextHonoAdapter(context).identity.ua() }),
    );

    const response = await app.request("/test", { headers: { "user-agent": "test-agent" } });

    expect(await response.json()).toEqual({ ua: "test-agent" });
  });

  test("revision - fromWeakETag", async () => {
    const strategy = new WeakETagExtractorHeaderStrategy();
    const app = new Hono()
      .use(new WeakETagExtractorHonoMiddleware({ strategy }).handle())
      .get("/test", (context) =>
        Response.json({
          revision: new RequestContextHonoAdapter(context).middleware.revision.fromWeakETag(),
        }),
      );

    const response = await app.request("/test", {
      headers: { [tools.WeakETag.IF_MATCH_HEADER_NAME]: "W/12345" },
    });

    expect(await response.json()).toEqual({ revision: 12345 });
  });

  test("revision - fromWeakETag - missing header", async () => {
    const strategy = new WeakETagExtractorHeaderStrategy();
    const app = new Hono()
      .use(new WeakETagExtractorHonoMiddleware({ strategy }).handle())
      .get("/test", (context) =>
        Response.json({
          revision: new RequestContextHonoAdapter(context).middleware.revision.fromWeakETag(),
        }),
      )
      .onError((error) => Response.json({ error: error.message }, { status: 500 }));

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ error: tools.RevisionError.Missing });
  });

  test("revision - fromWeakETag - invalid header - format", async () => {
    const strategy = new WeakETagExtractorHeaderStrategy();
    const app = new Hono()
      .use(new WeakETagExtractorHonoMiddleware({ strategy }).handle())
      .get("/test", (context) =>
        Response.json({
          revision: new RequestContextHonoAdapter(context).middleware.revision.fromWeakETag(),
        }),
      )
      .onError((error) => Response.json({ error: error.message }, { status: 500 }));

    const response = await app.request("/test", {
      headers: { [tools.WeakETag.IF_MATCH_HEADER_NAME]: "invalid" },
    });

    expect(await response.json()).toEqual({ error: tools.RevisionError.Missing });
  });

  test("revision - fromETag", async () => {
    const strategy = new ETagExtractorHeaderStrategy();
    const app = new Hono()
      .use(new ETagExtractorHonoMiddleware({ strategy }).handle())
      .get("/test", (context) =>
        Response.json({
          revision: new RequestContextHonoAdapter(context).middleware.revision.fromETag(),
        }),
      );

    const response = await app.request("/test", {
      headers: { [tools.ETag.IF_MATCH_HEADER_NAME]: "12345" },
    });

    expect(await response.json()).toEqual({ revision: 12345 });
  });

  test("revision - fromETag - missing header", async () => {
    const strategy = new ETagExtractorHeaderStrategy();
    const app = new Hono()
      .use(new ETagExtractorHonoMiddleware({ strategy }).handle())
      .get("/test", (context) =>
        Response.json({
          revision: new RequestContextHonoAdapter(context).middleware.revision.fromETag(),
        }),
      )
      .onError((error) => Response.json({ error: error.message }, { status: 500 }));

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ error: tools.RevisionError.Missing });
  });

  test("timeZoneOffset", async () => {
    const app = new Hono().use(new TimeZoneOffsetHonoMiddleware().handle()).get("/test", (context) =>
      Response.json({
        timeZoneOffset: new RequestContextHonoAdapter(context).middleware.timeZoneOffset().ms,
      }),
    );

    const response = await app.request("/test", {
      headers: { [TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME]: "120" },
    });

    expect(await response.json()).toEqual({ timeZoneOffset: tools.Duration.Minutes(120).ms });
  });

  test("timeZoneOffset - missing header", async () => {
    const app = new Hono().use(new TimeZoneOffsetHonoMiddleware().handle()).get("/test", (context) =>
      Response.json({
        timeZoneOffset: new RequestContextHonoAdapter(context).middleware.timeZoneOffset().ms,
      }),
    );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ timeZoneOffset: tools.Duration.Minutes(0).ms });
  });

  test("timeZoneOffset - invalid header - format", async () => {
    const app = new Hono().use(new TimeZoneOffsetHonoMiddleware().handle()).get("/test", (context) =>
      Response.json({
        timeZoneOffset: new RequestContextHonoAdapter(context).middleware.timeZoneOffset().ms,
      }),
    );

    const response = await app.request("/test", {
      headers: { [TimeZoneOffsetMiddleware.TIME_ZONE_OFFSET_HEADER_NAME]: "invalid-offset" },
    });

    expect(await response.json()).toEqual({ timeZoneOffset: tools.Duration.Minutes(0).ms });
  });

  test("language", async () => {
    const header = new LanguageDetectorHeaderStrategy();
    const app = new Hono()
      .use(new LanguageDetectorHonoMiddleware({ languages: mocks.languages, strategies: [header] }).handle())
      .get("/test", (context) =>
        Response.json({ language: new RequestContextHonoAdapter(context).middleware.language() }),
      );

    const response = await app.request("/test", { headers: { "Accept-Language": "pl-PL" } });

    expect(await response.json()).toEqual({ language: mocks.languages.supported.pl });
  });

  test("language - fallback", async () => {
    const app = new Hono()
      .use(new LanguageDetectorHonoMiddleware({ languages: mocks.languages, strategies: [] }).handle())
      .get("/test", (context) =>
        Response.json({ language: new RequestContextHonoAdapter(context).middleware.language() }),
      );

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ language: mocks.languages.fallback });
  });
});
