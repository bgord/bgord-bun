import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { RecaptchaSecretKey } from "../src/recaptcha-secret-key.vo";
import { ShieldCaptchaRecaptchaStrategy } from "../src/shield-captcha-recaptcha.strategy";

const VALID_SECRET_KEY = "x".repeat(40);
const VALID_TOKEN = "valid_token";

const shield = new ShieldCaptchaRecaptchaStrategy({ secretKey: RecaptchaSecretKey.parse(VALID_SECRET_KEY) });

const app = new Hono()
  .post("/", shield.verify, (c) => c.text("ok"))
  .onError((err, c) => {
    if (err instanceof Error) return c.json({ message: err.message }, 403);
    return c.text("internal error", 500);
  });

describe("ShieldCaptchaRecaptchaStrategy", () => {
  test("happy path - full verification", async () => {
    const fetchSpy = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "x-forwarded-for": "1.2.3.4" },
      body: new URLSearchParams({ "g-recaptcha-response": VALID_TOKEN }).toString(),
    });

    expect(response.status).toEqual(200);
    expect(await response.text()).toEqual("ok");

    const [url, config] = fetchSpy.mock.calls[0];

    expect(config?.method).toBe("POST");
    expect(config?.headers?.["Content-Type"]).toBe("application/x-www-form-urlencoded");

    const params = config?.body as URLSearchParams;

    expect(params).toBeInstanceOf(URLSearchParams);
    expect(params.get("secret")).toBe(VALID_SECRET_KEY);
    expect(params.get("response")).toBe(VALID_TOKEN);
    expect(params.get("remoteip")).toBe("1.2.3.4");
    expect(url).toBeDefined();
  });

  test("happy path - remote ip fallback", async () => {
    const fetchSpy = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );

    await app.request("http://localhost/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "g-recaptcha-response": VALID_TOKEN }).toString(),
    });

    const config = fetchSpy.mock.calls[0][1];
    const params = config?.body as URLSearchParams;

    expect(params.get("remoteip")).toBe("");
  });

  test("failure - missing token (Check Error Message)", async () => {
    const response = await app.request("http://localhost/", { method: "POST" });
    const json = await response.json();

    expect(response.status).toEqual(403);
    expect(json.message).toEqual("access_denied_recaptcha");
  });

  test("failure - low score", async () => {
    spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, score: 0.4 })));

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { "x-recaptcha-token": VALID_TOKEN },
    });

    expect(response.status).toEqual(403);
  });

  test("failure - fetch throws", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error("Network"));

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { "x-recaptcha-token": VALID_TOKEN },
    });

    expect(response.status).toEqual(403);
  });
});
