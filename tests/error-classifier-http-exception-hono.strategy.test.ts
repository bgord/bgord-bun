import { describe, expect, test } from "bun:test";
import { HTTPException } from "hono/http-exception";
import { ErrorClassifierHttpExceptionHonoStrategy } from "../src/error-classifier-http-exception-hono.strategy";

const message = "shield.api.key.rejected";

const strategy = new ErrorClassifierHttpExceptionHonoStrategy({ errors: [message] });

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

  test("unknown http exception", async () => {
    const result = strategy.classify(new HTTPException(413, { message: "shield.body.limit.rejected" }));

    expect(result?.status).toEqual(413);
    expect(await result?.text()).toEqual("shield.body.limit.rejected");
  });

  test("null", () => {
    expect(strategy.classify(null)).toEqual(null);
  });
});
