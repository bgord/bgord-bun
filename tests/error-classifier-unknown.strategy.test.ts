import { describe, expect, test } from "bun:test";
import { ErrorClassifierUnknownStrategy } from "../src/error-classifier-unknown.strategy";

const strategy = new ErrorClassifierUnknownStrategy();

describe("ErrorClassifierUnknownStrategy", () => {
  test("happy path", async () => {
    const result = strategy.classify(new Error("anything"));

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });

  test("null", async () => {
    const result = strategy.classify(null);

    expect(result.status).toEqual(500);
    expect(await result.json()).toEqual({ message: "general.unknown" });
  });
});
