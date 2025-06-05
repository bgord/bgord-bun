import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { SimulatedError } from "../src/simulated-error";

describe("SimulatedError", () => {
  test("responds with Cache-Hit: miss on first uncached request", async () => {
    const app = new Hono();

    app.get("/simulated-error", SimulatedError.handle, (_c) => expect.unreachable());

    await app.request("/simulated-error");
  });
});
