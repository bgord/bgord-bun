import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Retry } from "../src/retry.service";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import * as mocks from "./mocks";

const max = tools.IntegerPositive.parse(3);
const backoff = new RetryBackoffNoopStrategy();
const Sleeper = new SleeperNoopAdapter();
const deps = { Sleeper };

const retry = new Retry(deps);

describe("Retry service", () => {
  test("invalid max", async () => {
    // @ts-expect-error Intentional invalid positive integer
    expect(() => retry.run(async () => "ok", { max: 0, backoff })).toThrow("retry.invalid.max");
  });

  test("success", async () => {
    const action = spyOn({ run: async () => "ok" }, "run");

    const result = await retry.run(action, { max: tools.IntegerPositive.parse(1), backoff });

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
    const sleeperWait = spyOn(Sleeper, "wait");

    const result = await retry.run(action, { max, backoff });

    expect(result).toEqual("ok");
    expect(action).toHaveBeenCalledTimes(3);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("fail after max", async () => {
    const action = spyOn({ run: mocks.throwIntentionalErrorAsync }, "run");

    expect(async () => retry.run(action, { max, backoff })).toThrow(mocks.IntentionalError);
    expect(action).toHaveBeenCalledTimes(3);
  });

  test("retryWhen false", async () => {
    const action = spyOn({ run: mocks.throwIntentionalErrorAsync }, "run");

    expect(async () =>
      retry.run(action, { max: tools.IntegerPositive.parse(5), backoff: backoff, when: () => false }),
    ).toThrow(mocks.IntentionalError);
    expect(action).toHaveBeenCalledTimes(1);
  });
});
