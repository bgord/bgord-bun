// cspell:ignore remoteip
import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import * as v from "valibot";
import { RecaptchaSecretKey } from "../src/recaptcha-secret-key.vo";
import { ShieldRecaptchaHonoStrategy } from "../src/shield-recaptcha-hono.strategy";
import * as mocks from "./mocks";

const VALID_SECRET_KEY = "x".repeat(40);
const VALID_TOKEN = "valid_token";
const remoteip = "1.2.3.4";

const HOSTNAME = "app.example";

const shield = new ShieldRecaptchaHonoStrategy({
  secretKey: v.parse(RecaptchaSecretKey, VALID_SECRET_KEY),
  hostname: HOSTNAME,
});

const HEADERS = { "Content-Type": "application/x-www-form-urlencoded" };
const SAFE_BODY = "dummy=1";
const TOKEN_BODY = new URLSearchParams({ "g-recaptcha-response": VALID_TOKEN }).toString();
const TOKEN_JSON_BODY = JSON.stringify({ "g-recaptcha-response": VALID_TOKEN });

const onError = (error: Error) => {
  if (error instanceof Error) return Response.json({ message: error.message }, { status: 403 });
  return new Response("internal error", { status: 500 });
};

const app = new Hono().post("/", shield.handle(), () => new Response("ok")).onError(onError);

describe("ShieldRecaptchaHonoStrategy", () => {
  test("happy path", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, hostname: HOSTNAME })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: { ...HEADERS, "x-real-ip": remoteip }, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN, remoteip }),
      headers: HEADERS,
    });
  });

  test("happy path - conn info ip", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, hostname: HOSTNAME })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN, remoteip: mocks.ip }),
      headers: HEADERS,
    });
  });

  test("happy path - boundary score", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.5, hostname: HOSTNAME })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN, remoteip: mocks.ip }),
      headers: HEADERS,
    });
  });

  test("happy path - json body fallback", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, hostname: HOSTNAME })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", body: TOKEN_JSON_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN, remoteip: mocks.ip }),
      headers: HEADERS,
    });
  });

  test("failure - non-string json token", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, hostname: HOSTNAME })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", body: JSON.stringify({ "g-recaptcha-response": 123 }) },
      mocks.connInfo,
    );

    expect(response.status).toEqual(403);
    expect(globalFetch).not.toHaveBeenCalled();
  });

  test("failure - missing token", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, hostname: HOSTNAME })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: SAFE_BODY },
      mocks.connInfo,
    );
    const json = await response.json();

    expect(response.status).toEqual(403);
    expect(json.message).toEqual("shield.recaptcha.rejected");
    expect(globalFetch).not.toHaveBeenCalled();
  });

  test("failure - upstream api rejection", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(403);
    expect(globalFetch).toHaveBeenCalled();
  });

  test("failure - missing score", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(403);
    expect(globalFetch).toHaveBeenCalled();
  });

  test("failure - non-numeric score", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: "0.9" })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(403);
    expect(globalFetch).toHaveBeenCalled();
  });

  test("failure - low score", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.4 })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(403);
    expect(globalFetch).toHaveBeenCalled();
  });

  test("failure - custom threshold", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.1, hostname: HOSTNAME })),
    );
    const shield = new ShieldRecaptchaHonoStrategy({
      secretKey: v.parse(RecaptchaSecretKey, VALID_SECRET_KEY),
      hostname: HOSTNAME,
      threshold: 0.2,
    });
    const app = new Hono().post("/", shield.handle(), () => new Response("ok")).onError(onError);

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(403);
    expect(globalFetch).toHaveBeenCalled();
  });

  test("failure - fetch throws", async () => {
    using globalFetch = spyOn(global, "fetch").mockRejectedValue(mocks.IntentionalError);

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(403);
    expect(globalFetch).toHaveBeenCalled();
  });

  test("failure - foreign hostname", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, hostname: "evil.example" })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(403);
    expect(globalFetch).toHaveBeenCalled();
  });

  test("failure - missing hostname", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );

    const response = await app.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(403);
    expect(globalFetch).toHaveBeenCalled();
  });

  test("happy path - matching action", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, hostname: HOSTNAME, action: "login" })),
    );
    const withAction = new ShieldRecaptchaHonoStrategy({
      secretKey: v.parse(RecaptchaSecretKey, VALID_SECRET_KEY),
      hostname: HOSTNAME,
      action: "login",
    });
    const scoped = new Hono().post("/", withAction.handle(), () => new Response("ok")).onError(onError);

    const response = await scoped.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(200);
    expect(globalFetch).toHaveBeenCalled();
  });

  test("failure - mismatched action", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9, hostname: HOSTNAME, action: "newsletter" })),
    );
    const withAction = new ShieldRecaptchaHonoStrategy({
      secretKey: v.parse(RecaptchaSecretKey, VALID_SECRET_KEY),
      hostname: HOSTNAME,
      action: "login",
    });
    const scoped = new Hono().post("/", withAction.handle(), () => new Response("ok")).onError(onError);

    const response = await scoped.request(
      "http://localhost/",
      { method: "POST", headers: HEADERS, body: TOKEN_BODY },
      mocks.connInfo,
    );

    expect(response.status).toEqual(403);
    expect(globalFetch).toHaveBeenCalled();
  });
});
