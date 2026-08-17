import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import type { EndpointPort } from "../src/endpoint.port";
import { EndpointHonoAdapter } from "../src/endpoint-hono.adapter";
import type { HasRequestJson } from "../src/request-context.port";
import * as mocks from "./mocks";

describe("EndpointHonoAdapter", () => {
  test("request context", async () => {
    const endpoint: EndpointPort = async (context) =>
      Response.json({ path: context.request.path, method: context.request.method });

    const app = new Hono().get("/test", EndpointHonoAdapter.adapt(endpoint));

    const response = await app.request("/test");

    expect(await response.json()).toEqual({ path: "/test", method: "GET" });
  });

  test("request context slice", async () => {
    const endpoint: EndpointPort<HasRequestJson> = async (context) => {
      const body = await context.request.json();

      return Response.json({ received: body["value"] });
    };

    const app = new Hono().post("/test", EndpointHonoAdapter.adapt(endpoint));

    const response = await app.request("/test", {
      method: "POST",
      body: JSON.stringify({ value: "hello" }),
      headers: { "content-type": "application/json" },
    });

    expect(await response.json()).toEqual({ received: "hello" });
  });

  test("sync endpoint", async () => {
    const endpoint: EndpointPort = () => new Response(null, { status: 204 });

    const app = new Hono().get("/test", EndpointHonoAdapter.adapt(endpoint));

    const response = await app.request("/test");

    expect(response.status).toEqual(204);
  });

  test("async endpoint", async () => {
    const endpoint: EndpointPort = async () => new Response(null, { status: 204 });

    const app = new Hono().get("/test", EndpointHonoAdapter.adapt(endpoint));

    const response = await app.request("/test");

    expect(response.status).toEqual(204);
  });

  test("error propagation", async () => {
    const app = new Hono()
      .onError((error) => Response.json({ message: error.message }, { status: 500 }))
      .get("/test", EndpointHonoAdapter.adapt(mocks.throwIntentionalError));

    const response = await app.request("/test");

    expect(response.status).toEqual(500);
    expect(await response.json()).toEqual({ message: mocks.IntentionalError });
  });
});
