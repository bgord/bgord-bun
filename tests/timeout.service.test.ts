import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Timeout, TimeoutError } from "../src/timeout.service";

function delay<T>(value: T, duration: tools.Duration): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), duration.ms));
}

const timeout = tools.Duration.Ms(5);

describe("Timeout", () => {
  test("run - happy path", async () => {
    const action = delay("OK", tools.Duration.Ms(1));
    const result = await Timeout.run(action, timeout);

    expect(result).toEqual("OK");
  });

  test("run - error propagation", async () => {
    const action = Promise.reject(new Error("boom"));
    try {
      await Timeout.run(action, timeout);
      expect.unreachable();
    } catch (error) {
      expect(error.message).toEqual("boom");
    }
  });

  test("run - timeout", async () => {
    const action = delay("LATE", tools.Duration.Ms(10));
    try {
      await Timeout.run(action, timeout);
      expect.unreachable();
    } catch (error) {
      expect(error.message).toEqual(TimeoutError.Exceeded);
    }
  });
});
