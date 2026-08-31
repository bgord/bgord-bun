import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { ErrorClassifierMessageMapStrategy } from "../src/error-classifier-message-map.strategy";
import { ErrorHonoHandler } from "../src/error-hono.handler";

describe("ErrorHonoHandler", () => {
  test("happy path", async () => {
    const handler = new ErrorHonoHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "first", status: 412 } }),
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 400 } }),
      ],
    });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await app.request("/ping");

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "first" });
  });

  test("unmatched classifier", async () => {
    const handler = new ErrorHonoHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 412 } }),
      ],
    });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await app.request("/ping");

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "second" });
  });

  test("no matches", async () => {
    const handler = new ErrorHonoHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
      ],
    });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await app.request("/ping");

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("no classifiers", async () => {
    const handler = new ErrorHonoHandler({ classifiers: [] });
    const app = new Hono()
      .get("/ping", () => {
        throw new Error("revision.mismatch");
      })
      .onError(handler.handle());

    const result = await app.request("/ping");

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });
});
