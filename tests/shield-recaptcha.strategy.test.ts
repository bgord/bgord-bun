// cspell:ignore remoteip
import { describe, expect, spyOn, test } from "bun:test";
import * as v from "valibot";
import { RecaptchaSecretKey } from "../src/recaptcha-secret-key.vo";
import { ShieldRecaptchaStrategy, ShieldRecaptchaStrategyField } from "../src/shield-recaptcha.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const VALID_SECRET_KEY = "x".repeat(40);
const VALID_TOKEN = "valid_token";
const remoteip = "1.2.3.4";

const strategy = new ShieldRecaptchaStrategy({ secretKey: v.parse(RecaptchaSecretKey, VALID_SECRET_KEY) });

const HEADERS = { "Content-Type": "application/x-www-form-urlencoded" };

const form = new FormData();
form.set(ShieldRecaptchaStrategyField, VALID_TOKEN);

describe("ShieldRecaptchaStrategy", () => {
  test("happy path", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );
    const context = new RequestContextBuilder().withIp(remoteip).withForm(form).build();

    expect(await strategy.evaluate(context)).toEqual(true);
    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN, remoteip }),
      headers: HEADERS,
    });
  });

  test("happy path - no remote ip", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );
    const context = new RequestContextBuilder().withForm(form).build();

    expect(await strategy.evaluate(context)).toEqual(true);
    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN }),
      headers: HEADERS,
    });
  });

  test("happy path - boundary score", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.5 })),
    );
    const context = new RequestContextBuilder().withForm(form).build();

    expect(await strategy.evaluate(context)).toEqual(true);
    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN }),
      headers: HEADERS,
    });
  });

  test("happy path - json body fallback", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );
    const context = new RequestContextBuilder()
      .withJson({ [ShieldRecaptchaStrategyField]: VALID_TOKEN })
      .build();

    expect(await strategy.evaluate(context)).toEqual(true);
    expect(globalFetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: VALID_SECRET_KEY, response: VALID_TOKEN }),
      headers: HEADERS,
    });
  });

  test("failure - non-string json token", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );
    const context = new RequestContextBuilder().withJson({ [ShieldRecaptchaStrategyField]: 123 }).build();

    expect(await strategy.evaluate(context)).toEqual(false);
    expect(globalFetch).not.toHaveBeenCalled();
  });

  test("failure - missing token", async () => {
    using globalFetch = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.9 })),
    );
    const context = new RequestContextBuilder().build();

    expect(await strategy.evaluate(context)).toEqual(false);
    expect(globalFetch).not.toHaveBeenCalled();
  });

  test("failure - upstream api rejection", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: false })));
    const context = new RequestContextBuilder().withForm(form).build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("failure - missing score", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true })));
    const context = new RequestContextBuilder().withForm(form).build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("failure - non-numeric score", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: "0.9" })),
    );
    const context = new RequestContextBuilder().withForm(form).build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("failure - low score", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.4 })),
    );
    const context = new RequestContextBuilder().withForm(form).build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("failure - custom threshold", async () => {
    using _ = spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.1 })),
    );
    const context = new RequestContextBuilder().withForm(form).build();
    const strategy = new ShieldRecaptchaStrategy({
      secretKey: v.parse(RecaptchaSecretKey, VALID_SECRET_KEY),
      threshold: 0.2,
    });

    expect(await strategy.evaluate(context)).toEqual(false);
  });

  test("failure - fetch throws", async () => {
    using _ = spyOn(global, "fetch").mockRejectedValue(mocks.IntentionalError);
    const context = new RequestContextBuilder().withForm(form).build();

    expect(await strategy.evaluate(context)).toEqual(false);
  });
});
