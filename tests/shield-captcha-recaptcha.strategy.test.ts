import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { RecaptchaSecretKey } from "../src/recaptcha-secret-key.vo";
import { ShieldCaptchaRecaptchaStrategy } from "../src/shield-captcha-recaptcha.strategy";
import * as mocks from "./mocks";

const VALID_SECRET_KEY = "x".repeat(40);
const VALID_TOKEN = "valid_token";

const shield = new ShieldCaptchaRecaptchaStrategy({ secretKey: RecaptchaSecretKey.parse(VALID_SECRET_KEY) });

const SAFE_HEADERS = { "Content-Type": "application/x-www-form-urlencoded" };
const SAFE_BODY = "dummy=1";

const app = new Hono()
  .post("/", shield.verify, (c) => c.text("ok"))
  .onError((err, c) => {
    if (err instanceof Error) return c.json({ message: err.message }, 403);
    return c.text("internal error", 500);
  });

describe("ShieldCaptchaRecaptchaStrategy", () => {
  test("happy path - full verification", async () => {
    const globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { ...SAFE_HEADERS, "x-forwarded-for": "1.2.3.4" },
      body: new URLSearchParams({ "g-recaptcha-response": VALID_TOKEN }).toString(),
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");

    const [, config] = globalFetch.mock.calls[0];
    const params = config?.body as URLSearchParams;

    expect(config?.method).toEqual("POST");
    expect(config?.headers).toEqual(SAFE_HEADERS);
    expect(params.get("secret")).toEqual(VALID_SECRET_KEY);
    expect(params.get("remoteip")).toEqual("1.2.3.4");
  });

  test("happy path - remote ip fallback", async () => {
    const globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );

    await app.request("http://localhost/", {
      method: "POST",
      headers: SAFE_HEADERS,
      body: new URLSearchParams({
        "g-recaptcha-response": VALID_TOKEN,
      }).toString(),
    });
    const config = globalFetch.mock.calls[0][1];
    const params = config?.body as URLSearchParams;

    expect(params.get("remoteip")).toEqual("");
  });

  test("happy path - boundary score 0.5", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, score: 0.5 })));

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { ...SAFE_HEADERS, "x-recaptcha-token": VALID_TOKEN },
      body: SAFE_BODY,
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");
  });

  test("failure - missing token (Check Error Message)", async () => {
    const globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: SAFE_HEADERS,
      body: SAFE_BODY,
    });
    const json = await response.json();

    expect(response.status).toEqual(403);
    expect(json.message).toEqual("access_denied_recaptcha");
    expect(globalFetch).not.toHaveBeenCalled();
  });

  test("failure - upstream api rejection", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: false })));

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { ...SAFE_HEADERS, "x-recaptcha-token": VALID_TOKEN },
      body: SAFE_BODY,
    });

    expect(response.status).toEqual(403);
  });

  test("failure - low score", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, score: 0.4 })));

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { ...SAFE_HEADERS, "x-recaptcha-token": VALID_TOKEN },
      body: SAFE_BODY,
    });

    expect(response.status).toEqual(403);
  });

  test("failure - fetch throws", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentionalError));

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { ...SAFE_HEADERS, "x-recaptcha-token": VALID_TOKEN },
      body: SAFE_BODY,
    });

    expect(response.status).toEqual(403);
  });
});
