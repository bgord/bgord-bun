import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { TimeoutCancellableError } from "../src/timeout-cancellable-runner.port";
import { TimeoutCancellableRunnerBare } from "../src/timeout-cancellable-runner-bare.adapter";
import * as mocks from "./mocks";

const timeout = tools.Duration.Ms(1);
const over = timeout.times(tools.MultiplicationFactor.parse(10)).ms;
const adapter = new TimeoutCancellableRunnerBare();

describe("TimeoutCancellableRunnerBare", () => {
  test(" happy path", async () => {
    const action = async (_signal: AbortSignal) => 2;

    const result = await adapter.cancellable(action, timeout);

    expect(result).toEqual(2);
  });

  test("cancellable - error propagation", async () => {
    expect(async () => adapter.cancellable(mocks.throwIntentionalErrorAsync, timeout)).toThrow(
      mocks.IntentionalError,
    );
  });

  test("cancellable - timeout", async () => {
    jest.useFakeTimers();
    const action = jest.fn(
      async (_signal: AbortSignal) => new Promise((resolve) => setTimeout(resolve, over)),
    );

    const promise = adapter.cancellable(action, timeout);
    jest.runAllTimers();

    const signal = action.mock.calls[0]?.[0];
    expect(promise).rejects.toThrow(TimeoutCancellableError.Exceeded);
    expect(signal?.aborted).toBe(true);
    expect(signal?.reason.message).toEqual(TimeoutCancellableError.Exceeded);

    jest.useRealTimers();
  });
});
