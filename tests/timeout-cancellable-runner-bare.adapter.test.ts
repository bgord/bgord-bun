import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { TimeoutCancellableRunnerBare } from "../src/timeout-cancellable-runner-bare.adapter";
import * as mocks from "./mocks";

const timeout = tools.Duration.MIN;
const over = timeout.times(v.parse(tools.MultiplicationFactor, 10)).ms;
const adapter = new TimeoutCancellableRunnerBare();

describe("TimeoutCancellableRunnerBare", () => {
  test(" happy path", async () => {
    jest.useFakeTimers();
    let signal: AbortSignal | undefined;
    const action = async (received: AbortSignal) => {
      signal = received;
      return 2;
    };

    const result = await adapter.cancellable(action, timeout);
    jest.runAllTimers();

    expect(result).toEqual(2);
    expect(signal?.aborted).toEqual(false);

    jest.useRealTimers();
  });

  test("cancellable - error propagation", async () => {
    jest.useFakeTimers();
    let signal: AbortSignal | undefined;
    const action = async (received: AbortSignal) => {
      signal = received;
      return mocks.throwIntentionalErrorAsync();
    };

    const runner = adapter.cancellable(action, timeout);
    await runner.catch(() => {});
    jest.runAllTimers();

    expect(runner).rejects.toThrow(mocks.IntentionalError);
    expect(signal?.aborted).toEqual(false);

    jest.useRealTimers();
  });

  test("cancellable - timeout", async () => {
    jest.useFakeTimers();
    const action = jest.fn(
      async (_signal: AbortSignal) => new Promise((resolve) => setTimeout(resolve, over)),
    );

    const runner = adapter.cancellable(action, timeout);
    jest.runAllTimers();

    const signal = action.mock.calls[0]?.[0];
    expect(runner).rejects.toThrow("timeout.cancellable.exceeded");
    expect(signal?.aborted).toEqual(true);
    expect(signal?.reason.message).toEqual("timeout.cancellable.exceeded");

    jest.useRealTimers();
  });
});
