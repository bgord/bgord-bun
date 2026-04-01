import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import * as v from "valibot";
import { RecaptchaSecretKey } from "../src/recaptcha-secret-key.vo";
import { ShieldRecaptchaHonoStrategy } from "../src/shield-recaptcha-hono.strategy";
import * as mocks from "./mocks";

const VALID_SECRET_KEY = "x".repeat(40);
const VALID_TOKEN = "valid_token";
const remoteip = "1.2.3.4";

const shield = new ShieldRecaptchaHonoStrategy({ secretKey: v.parse(RecaptchaSecretKey, VALID_SECRET_KEY) });

const HEADERS = { "Content-Type": "application/x-www-form-urlencoded" };
const SAFE_BODY = "dummy=1";

const app = new Hono()
  .post("/", shield.handle(), (c) => c.text("ok"))
  .onError((err, c) => {
    if (err instanceof Error) return c.json({ message: err.message }, 403);
    return c.text("internal error", 500);
  });

describe("ShieldRecaptchaHonoStrategy", () => {
  test("happy path", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { ...HEADERS, "x-forwarded-for": remoteip },
      body: new URLSearchParams({ "g-recaptcha-response": VALID_TOKEN }).toString(),
    });
    const text = await response.text();

    expect(response.status).toEqual(200);
    expect(text).toEqual("ok");
    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN, remoteip }),
      headers: HEADERS,
    });
  });

  test("happy path - remote ip fallback", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );

    await app.request("http://localhost/", {
      method: "POST",
      headers: HEADERS,
      body: new URLSearchParams({ "g-recaptcha-response": VALID_TOKEN }).toString(),
    });

    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN, remoteip: "" }),
      headers: HEADERS,
    });
  });

  test("happy path - boundary score", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.5 })),
    );

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { ...HEADERS, "x-recaptcha-token": VALID_TOKEN },
      body: SAFE_BODY,
    });
    const text = await response.text();

    expect(response.status).toEqual(200);
    expect(text).toEqual("ok");
    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN, remoteip: "" }),
      headers: HEADERS,
    });
  });

  test("failure - missing token", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: HEADERS,
      body: SAFE_BODY,
    });
    const json = await response.json();

    expect(response.status).toEqual(403);
    expect(json.message).toEqual("shield.recaptcha.rejected");
    expect(globalFetch).not.toHaveBeenCalled();
  });

  test("failure - upstream api rejection", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: false })));

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { ...HEADERS, "x-recaptcha-token": VALID_TOKEN },
      body: SAFE_BODY,
    });

    expect(response.status).toEqual(403);
  });

  test("failure - low score", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.4 })),
    );

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { ...HEADERS, "x-recaptcha-token": VALID_TOKEN },
      body: SAFE_BODY,
    });

    expect(response.status).toEqual(403);
  });

  test("failure - fetch throws", async () => {
    using _ = spyOn(global, "fetch").mockRejectedValue(mocks.IntentionalError);

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { ...HEADERS, "x-recaptcha-token": VALID_TOKEN },
      body: SAFE_BODY,
    });

    expect(response.status).toEqual(403);
  });
});
