import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";

describe("RequestId", () => {
  test("generates requestId when x-correlation-id header is not provided", async () => {
    const fresh = "fresh";
    const IdProvider = new IdProviderDeterministicAdapter([fresh]);

    const app = new Hono();
    app.use(
      requestId({ limitLength: 36, headerName: "x-correlation-id", generator: () => IdProvider.generate() }),
    );
    app.get("/ping", async (c) => c.json({ requestId: c.get("requestId") }));

    const result = await app.request("/ping");
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual({ requestId: fresh });
    expect(result.headers.get("x-correlation-id")).toEqual(fresh);
  });

  test("sets requestId when x-correlation-id header is provided", async () => {
    const predefinedRequestId = "18b33a92-afbf-4a0c-8d2d-49716921d0af";
    const IdProvider = new IdProviderDeterministicAdapter([predefinedRequestId]);
    const app = new Hono();
    app.use(
      requestId({ limitLength: 36, headerName: "x-correlation-id", generator: () => IdProvider.generate() }),
    );
    app.get("/ping", async (c) => c.json({ requestId: c.get("requestId") }));

    const result = await app.request("/ping", {
      headers: new Headers({ "x-correlation-id": predefinedRequestId }),
    });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual({ requestId: predefinedRequestId });
    expect(result.headers.get("x-correlation-id")).toEqual(predefinedRequestId);
  });

  test("handles invalid continue-request-id header gracefully", async () => {
    const predefinedRequestId = "x".repeat(37);
    const fresh = "fresh";
    const IdProvider = new IdProviderDeterministicAdapter([fresh]);
    const app = new Hono();
    app.use(
      requestId({ limitLength: 36, headerName: "x-correlation-id", generator: () => IdProvider.generate() }),
    );
    app.get("/ping", async (c) => c.json({ requestId: c.get("requestId") }));

    const result = await app.request("/ping", {
      headers: new Headers({ "x-correlation-id": predefinedRequestId }),
    });
    const json = await result.json();

    expect(result.status).toEqual(200);
    expect(json).toEqual({ requestId: fresh });
    expect(result.headers.get("x-correlation-id")).toEqual(fresh);
  });
});
