import { describe, expect, test } from "bun:test";
import { HTTPException } from "hono/http-exception";
import { ErrorClassifierHttpExceptionHonoStrategy } from "../src/error-classifier-http-exception-hono.strategy";

enum SampleUploaderError {
  MissingFile = "file.uploader.missing.file",
  EmptyFile = "file.uploader.empty.file",
}

const message = "shield.api.key.rejected";

const strategy = new ErrorClassifierHttpExceptionHonoStrategy([message, SampleUploaderError]);

describe("ErrorClassifierHttpExceptionHonoStrategy", () => {
  test("happy path", async () => {
    const result = strategy.classify(new HTTPException(401, { message }));

    expect(result?.status).toEqual(401);
    expect(await result?.json()).toEqual({ message });
  });

  test("happy path - headers", async () => {
    const result = strategy.classify(
      new HTTPException(401, {
        message,
        res: new Response(message, { headers: { "WWW-Authenticate": 'Basic realm="app"' } }),
      }),
    );

    expect(result?.status).toEqual(401);
    expect(result?.headers.get("WWW-Authenticate")).toEqual('Basic realm="app"');
    expect(await result?.json()).toEqual({ message });
  });

  test("object entry first member", async () => {
    const result = strategy.classify(new HTTPException(400, { message: "file.uploader.missing.file" }));

    expect(result?.status).toEqual(400);
    expect(await result?.json()).toEqual({ message: "file.uploader.missing.file" });
  });

  test("object entry second member", async () => {
    const result = strategy.classify(new HTTPException(400, { message: "file.uploader.empty.file" }));

    expect(result?.status).toEqual(400);
    expect(await result?.json()).toEqual({ message: "file.uploader.empty.file" });
  });

  test("unknown http exception", async () => {
    const result = strategy.classify(new HTTPException(413, { message: "shield.body.limit.rejected" }));

    expect(result?.status).toEqual(413);
    expect(await result?.text()).toEqual("shield.body.limit.rejected");
  });

  test("empty config", async () => {
    const result = new ErrorClassifierHttpExceptionHonoStrategy([]).classify(
      new HTTPException(401, { message }),
    );

    expect(result?.status).toEqual(401);
    expect(await result?.text()).toEqual(message);
  });

  test("null", () => {
    expect(strategy.classify(null)).toEqual(null);
  });
});
