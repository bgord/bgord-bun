import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { TimeoutError } from "../src/timeout-runner.port";
import { TimeoutRunnerBareAdapter } from "../src/timeout-runner-bare.adapter";
import * as mocks from "./mocks";

const immediate = async () => 2;
const timeout = tools.Duration.Ms(1);
const over = timeout.times(tools.MultiplicationFactor.parse(10)).ms;
const adapter = new TimeoutRunnerBareAdapter();

describe("TimeoutRunnerBareAdapter", () => {
  test("run - happy path", async () => {
    expect(await adapter.run(immediate(), timeout)).toEqual(2);
  });

  test("run - error propagation", async () => {
    expect(async () => adapter.run(mocks.throwIntentionalErrorAsync(), timeout)).toThrow(
      mocks.IntentionalError,
    );
  });

  test("run - timeout", async () => {
    jest.useFakeTimers();
    const action = new Promise((resolve) => setTimeout(resolve, over));

    const runner = adapter.run(action, timeout);
    jest.runAllTimers();

    expect(runner).rejects.toThrow(TimeoutError.Exceeded);

    jest.useRealTimers();
  });
});
