import { describe, expect, spyOn, test } from "bun:test";
import express from "express";
import request from "supertest";
import { RecaptchaSecretKey } from "../src/recaptcha-secret-key.vo";
import { ShieldRecaptchaExpressStrategy } from "../src/shield-recaptcha-express.strategy";
import * as mocks from "./mocks";

const VALID_SECRET_KEY = "x".repeat(40);
const VALID_TOKEN = "valid_token";
const remoteip = "1.2.3.4";

const shield = new ShieldRecaptchaExpressStrategy({ secretKey: RecaptchaSecretKey.parse(VALID_SECRET_KEY) });

const HEADERS = { "Content-Type": "application/x-www-form-urlencoded" };
const SAFE_BODY = "dummy=1";

const app = express()
  .use(express.urlencoded({ extended: true }))
  .post("/", shield.handle(), (_request, response) => response.send("ok"))
  .use((err: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) =>
    response.status(403).json({ message: err.message }),
  );

describe("ShieldRecaptchaExpressStrategy", () => {
  test("happy path", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );

    const response = await request(app)
      .post("/")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("x-forwarded-for", remoteip)
      .send(`g-recaptcha-response=${VALID_TOKEN}`);

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
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

    await request(app)
      .post("/")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(`g-recaptcha-response=${VALID_TOKEN}`);

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

    const response = await request(app)
      .post("/")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("x-recaptcha-token", VALID_TOKEN)
      .send(SAFE_BODY);

    expect(response.status).toEqual(200);
    expect(response.text).toEqual("ok");
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

    const response = await request(app)
      .post("/")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(SAFE_BODY);

    expect(response.status).toEqual(403);
    expect(response.body.message).toEqual("shield.recaptcha.rejected");
    expect(globalFetch).not.toHaveBeenCalled();
  });

  test("failure - upstream api rejection", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: false })));

    const response = await request(app)
      .post("/")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("x-recaptcha-token", VALID_TOKEN)
      .send(SAFE_BODY);

    expect(response.status).toEqual(403);
  });

  test("failure - low score", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.4 })),
    );

    const response = await request(app)
      .post("/")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("x-recaptcha-token", VALID_TOKEN)
      .send(SAFE_BODY);

    expect(response.status).toEqual(403);
  });

  test("failure - fetch throws", async () => {
    using _ = spyOn(global, "fetch").mockRejectedValue(mocks.IntentionalError);

    const response = await request(app)
      .post("/")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("x-recaptcha-token", VALID_TOKEN)
      .send(SAFE_BODY);

    expect(response.status).toEqual(403);
  });
});
