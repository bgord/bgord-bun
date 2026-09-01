import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { ErrorClassifierValidationStrategy } from "../src/error-classifier-validation.strategy";

const SampleError = { Invalid: "sample.invalid", Type: "sample.type" };

const strategy = new ErrorClassifierValidationStrategy(["uuid.type", SampleError]);

const parsed = v.safeParse(v.string("uuid.type"), 123);
const valibotError = parsed.success ? null : new v.ValiError(parsed.issues);

describe("ErrorClassifierValidationStrategy", () => {
  test("happy path", async () => {
    const result = strategy.classify(valibotError);

    expect(result?.status).toEqual(400);
    expect(await result?.json()).toEqual({ message: "uuid.type" });
  });

  test("object entry first member", async () => {
    const result = strategy.classify(
      Object.assign(new Error("validation"), { issues: [{ message: "sample.invalid" }] }),
    );

    expect(result?.status).toEqual(400);
    expect(await result?.json()).toEqual({ message: "sample.invalid" });
  });

  test("object entry second member", async () => {
    const result = strategy.classify(
      Object.assign(new Error("validation"), { issues: [{ message: "sample.type" }] }),
    );

    expect(result?.status).toEqual(400);
    expect(await result?.json()).toEqual({ message: "sample.type" });
  });

  test("unexpected issue", async () => {
    const result = strategy.classify(
      Object.assign(new Error("validation"), { issues: [{ message: "string.type" }] }),
    );

    expect(result?.status).toEqual(400);
    expect(await result?.json()).toEqual({ message: "payload.invalid.error" });
  });

  test("empty config", async () => {
    const result = new ErrorClassifierValidationStrategy([]).classify(
      Object.assign(new Error("validation"), { issues: [{ message: "uuid.type" }] }),
    );

    expect(result?.status).toEqual(400);
    expect(await result?.json()).toEqual({ message: "payload.invalid.error" });
  });

  test("malformed issue", () => {
    const error = Object.assign(new Error("validation"), { issues: [{ message: "uuid.type" }, null] });

    expect(strategy.classify(error)).toEqual(null);
  });

  test("empty issues", () => {
    const error = Object.assign(new Error("validation"), { issues: [] });

    expect(strategy.classify(error)).toEqual(null);
  });

  test("error without issues", () => {
    expect(strategy.classify(new Error("uuid.type"))).toEqual(null);
  });

  test("null", () => {
    expect(strategy.classify(null)).toEqual(null);
  });
});
