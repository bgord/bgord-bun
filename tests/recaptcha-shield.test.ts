import { describe, expect, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { RecaptchaSecretKey, RecaptchaShield } from "../src/recaptcha-shield.middleware";

const VALID_SECRET_KEY = "x".repeat(40);

const VALID_TOKEN = "valid_token";
const INVALID_TOKEN = "invalid_token";

describe("RecaptchaShield", () => {
  test("body - passes when recaptcha verification is successful", async () => {
    const shield = new RecaptchaShield({
      secretKey: RecaptchaSecretKey.parse(VALID_SECRET_KEY),
    });

    const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const app = new Hono();
    app.post("/", shield.build, (c) => c.text("ok"));

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "g-recaptcha-response": VALID_TOKEN,
      }).toString(),
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe("ok");
    expect(fetchSpy).toHaveBeenCalled();
  });

  test("headers - passes when recaptcha verification is successful", async () => {
    const shield = new RecaptchaShield({
      secretKey: RecaptchaSecretKey.parse(VALID_SECRET_KEY),
    });

    const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const app = new Hono();
    app.post("/", shield.build, (c) => c.text("ok"));

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
        "x-recaptcha-token": VALID_TOKEN,
      }),
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe("ok");
    expect(fetchSpy).toHaveBeenCalled();
  });

  test("query - passes when recaptcha verification is successful", async () => {
    const shield = new RecaptchaShield({
      secretKey: RecaptchaSecretKey.parse(VALID_SECRET_KEY),
    });

    const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const app = new Hono();
    app.post("/", shield.build, (c) => c.text("ok"));

    const response = await app.request(`http://localhost/?recaptchaToken=${VALID_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe("ok");
    expect(fetchSpy).toHaveBeenCalled();
  });

  test("throws AccessDeniedError when recaptcha fails", async () => {
    const shield = new RecaptchaShield({
      secretKey: RecaptchaSecretKey.parse(VALID_SECRET_KEY),
    });

    const fetchSpy = spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    );

    const app = new Hono();
    app.post("/", shield.build, (c) => c.text("ok"));

    const response = await app.request("http://localhost/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "g-recaptcha-response": INVALID_TOKEN,
      }).toString(),
    });

    expect(response.status).toBe(403);
    expect(fetchSpy).toHaveBeenCalled();
  });
});
