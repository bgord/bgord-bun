import { describe, expect, test } from "bun:test";
import { TimeoutCancellableRunnerNoop } from "../src/timeout-cancellable-runner-noop.adapter";

const timeout = new TimeoutCancellableRunnerNoop();

describe("TimeoutCancellableRunnerNoop", () => {
  test(" happy path", async () => {
    const action = async (_signal: AbortSignal) => 2;

    const result = await timeout.cancellable(action);

    expect(result).toEqual(2);
  });
});
