import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";

const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("RequestId", () => {
  test("generates requestId when x--request-id header is not provided", async () => {
    const app = new Hono();
    app.use(requestId({ limitLength: 36 }));
    app.get("/ping", async (c) => c.json({ requestId: c.get("requestId") }));

    const result = await app.request("/ping");
    expect(result.status).toEqual(200);

    const json = await result.json();
    expect(json).toEqual({ requestId: expect.stringMatching(regex) });
    expect(result.headers.get("x-request-id")).toEqual(json.requestId);
  });

  test("sets requestId when x-request-id header is provided", async () => {
    const predefinedRequestId = "18b33a92-afbf-4a0c-8d2d-49716921d0af";
    const app = new Hono();
    app.use(requestId({ limitLength: 36 }));
    app.get("/ping", async (c) => c.json({ requestId: c.get("requestId") }));

    const result = await app.request("/ping", {
      headers: new Headers({ "x-request-id": predefinedRequestId }),
    });
    expect(result.status).toEqual(200);

    const json = await result.json();
    expect(json).toEqual({ requestId: predefinedRequestId });
    expect(result.headers.get("x-request-id")).toEqual(predefinedRequestId);
  });

  test("handles invalid continue-request-id header gracefully", async () => {
    const predefinedRequestId = "x".repeat(37);
    const app = new Hono();
    app.use(requestId({ limitLength: 36 }));
    app.get("/ping", async (c) => c.json({ requestId: c.get("requestId") }));

    const result = await app.request("/ping", {
      headers: new Headers({ "x-request-id": predefinedRequestId }),
    });
    expect(result.status).toEqual(200);

    const json = await result.json();
    expect(json).toEqual({
      requestId: expect.not.stringContaining(predefinedRequestId),
    });
    expect(result.headers.get("x-request-id")).not.toEqual(predefinedRequestId);
  });
});
