import { describe, expect, test } from "bun:test";
import { ErrorHandler } from "../src/error.handler";
import { ErrorClassifierMessageMapStrategy } from "../src/error-classifier-message-map.strategy";
import { RequestContextBuilder } from "./request-context-builder";

const context = new RequestContextBuilder().build();

describe("ErrorHandler", () => {
  test("happy path", async () => {
    const handler = new ErrorHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "first", status: 412 } }),
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 400 } }),
      ],
    });

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "first" });
  });

  test("unmatched classifier", async () => {
    const handler = new ErrorHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
        new ErrorClassifierMessageMapStrategy({ "revision.mismatch": { message: "second", status: 412 } }),
      ],
    });

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(412);
    expect(await result.json()).toEqual({ message: "second" });
  });

  test("no matches", async () => {
    const handler = new ErrorHandler({
      classifiers: [
        new ErrorClassifierMessageMapStrategy({ "mime.value.invalid": { message: "first", status: 400 } }),
      ],
    });

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("no classifiers", async () => {
    const handler = new ErrorHandler({ classifiers: [] });

    const result = handler.handle(new Error("revision.mismatch"), context);

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });
});
