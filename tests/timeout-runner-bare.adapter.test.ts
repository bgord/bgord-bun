import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { TimeoutRunnerBareAdapter } from "../src/timeout-runner-bare.adapter";
import * as mocks from "./mocks";

const immediate = async () => 2;
const timeout = tools.Duration.MIN;
const over = timeout.times(v.parse(tools.MultiplicationFactor, 10)).ms;
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

    expect(runner).rejects.toThrow("timeout.exceeded");

    jest.useRealTimers();
  });
});
