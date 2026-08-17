import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { SimulatedErrorHonoMiddleware } from "../src/simulated-error-hono.middleware";

describe("SimulatedErrorHonoMiddleware", () => {
  test("throws simulated error in handler", async () => {
    const app = new Hono()
      .onError((error) => {
        if (error.message === "simulated.error") return new Response("caught", { status: 418 });
        throw error;
      })
      .get("/simulated-error", new SimulatedErrorHonoMiddleware().handle());

    const response = await app.request("/simulated-error");

    expect(response.status).toEqual(418);
    expect(await response.text()).toEqual("caught");
  });
});
