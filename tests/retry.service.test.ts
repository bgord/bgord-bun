import { describe, expect, spyOn, test } from "bun:test";
import { Retry, RetryError } from "../src/retry.service";
import { RetryBackoffStrategyNoop } from "../src/retry-backoff-strategy-noop";
import * as mocks from "./mocks";

const max = 3;
const backoff = new RetryBackoffStrategyNoop();

describe("Retry service", () => {
  test("invalid max", async () => {
    expect(() => Retry.run(async () => "ok", { max: 0, backoff })).toThrow(RetryError.InvalidMax);
  });

  test("success", async () => {
    const action = spyOn({ run: async () => "ok" }, "run");

    const result = await Retry.run(action, { max, backoff });

    expect(result).toEqual("ok");
    expect(action).toHaveBeenCalledTimes(1);
  });

  test("retry then success", async () => {
    let calls = 0;
    const action = spyOn(
      {
        run: async () => {
          calls++;

          if (calls < 3) throw new Error(mocks.IntentionalError);
          return "ok";
        },
      },
      "run",
    );
    const bunSleep = spyOn(Bun, "sleep").mockResolvedValue(undefined);

    const result = await Retry.run(action, { max, backoff });

    expect(result).toEqual("ok");
    expect(action).toHaveBeenCalledTimes(3);
    expect(bunSleep).toHaveBeenCalledTimes(2);
  });

  test("fail after max", async () => {
    const action = spyOn({ run: mocks.throwIntentionalErrorAsync }, "run");

    expect(async () => Retry.run(action, { max, backoff })).toThrow(mocks.IntentionalError);
    expect(action).toHaveBeenCalledTimes(3);
  });

  test("retryWhen false", async () => {
    const action = spyOn({ run: mocks.throwIntentionalErrorAsync }, "run");

    expect(async () => Retry.run(action, { max: 5, backoff: backoff, when: () => false })).toThrow(
      mocks.IntentionalError,
    );
    expect(action).toHaveBeenCalledTimes(1);
  });
});
