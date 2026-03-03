import { describe, expect, test } from "bun:test";
import { SimulatedErrorMiddleware } from "../src/simulated-error.middleware";

describe("SimulatedErrorMiddleware", () => {
  test("throws simulated error", () => {
    const middleware = new SimulatedErrorMiddleware();

    expect(() => middleware.evaluate()).toThrow("Simulated error");
  });
});
