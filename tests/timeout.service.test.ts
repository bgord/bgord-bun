import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Timeout } from "../src/timeout.service";
import { TimeoutError } from "../src/timeout-runner.port";
import * as mocks from "./mocks";

function delay<T>(value: T, duration: tools.Duration): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), duration.ms));
}

const timeout = tools.Duration.Ms(5);

describe("Timeout service", () => {
  test("cancellable - happy path", async () => {
    const action = (_signal: AbortSignal) => delay("OK", tools.Duration.Ms(1));

    const result = await Timeout.cancellable(action, timeout);

    expect(result).toEqual("OK");
  });

  test("cancellable - error propagation", async () => {
    try {
      await Timeout.cancellable(mocks.throwIntentionalErrorAsync, timeout);

      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).toEqual(mocks.IntentionalError);
    }
  });

  test("cancellable - timeout", async () => {
    let captured: AbortSignal | null = null;
    const action = (signal: AbortSignal) => {
      captured = signal;
      return delay("LATE", tools.Duration.Ms(10));
    };

    try {
      await Timeout.cancellable(action, timeout);

      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).toEqual(TimeoutError.Exceeded);
      expect(captured).not.toBeNull();
      expect(captured!.aborted).toEqual(true);
      expect(captured!.reason.message).toEqual(TimeoutError.Exceeded);
    }
  });
});
