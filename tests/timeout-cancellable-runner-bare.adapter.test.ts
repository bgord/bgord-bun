import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { TimeoutCancellableError } from "../src/timeout-cancellable-runner.port";
import { TimeoutCancellableRunnerBare } from "../src/timeout-cancellable-runner-bare.adapter";
import * as mocks from "./mocks";

const duration = tools.Duration.Ms(1);
const timeout = new TimeoutCancellableRunnerBare();

describe("TimeoutCancellableRunnerBare", () => {
  test(" happy path", async () => {
    const action = async (_signal: AbortSignal) => 2;

    const result = await timeout.cancellable(action, duration);

    expect(result).toEqual(2);
  });

  test("cancellable - error propagation", async () => {
    expect(async () => timeout.cancellable(mocks.throwIntentionalErrorAsync, duration)).toThrow(
      mocks.IntentionalError,
    );
  });

  test("cancellable - timeout", async () => {
    const action = {
      run: async (_signal: AbortSignal) => {
        await Bun.sleep(duration.times(tools.MultiplicationFactor.parse(5)).ms);
        return 2;
      },
    };
    const actionRun = spyOn(action, "run");

    expect(async () => timeout.cancellable(action.run, duration)).toThrow(TimeoutCancellableError.Exceeded);

    const captured = actionRun.mock.calls[0]?.[0];

    expect(captured).not.toBeNull();
    expect(captured!.aborted).toEqual(true);
    expect(captured!.reason.message).toEqual(TimeoutCancellableError.Exceeded);
  });
});
