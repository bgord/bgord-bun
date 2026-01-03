import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { SimulatedError } from "../src/simulated-error.middleware";

describe("SimulatedError middleware", () => {
  test("throws simulated error", async () => {
    const app = new Hono()
      .onError((error, c) => {
        if (error.message === "Simulated error") return c.text("caught", 418);
        throw error;
      })
      .get("/simulated-error", SimulatedError.handle(), (c) => c.text("unreachable", 200));

    const response = await app.request("/simulated-error");

    expect(response.status).toEqual(418);
    expect(await response.text()).toEqual("caught");
  });
});
