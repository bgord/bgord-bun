import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { SimulatedError } from "../src/simulated-error.middleware";

describe("SimulatedError middleware", () => {
  test("happy path", async () => {
    const app = new Hono().get("/simulated-error", SimulatedError.handle, (_c) => expect.unreachable());
    await app.request("/simulated-error");
  });
});
