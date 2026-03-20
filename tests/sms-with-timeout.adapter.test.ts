import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { SmsNoopAdapter } from "../src/sms-noop.adapter";
import { SmsWithTimeoutAdapter } from "../src/sms-with-timeout.adapter";
import { TimeoutRunnerBareAdapter } from "../src/timeout-runner-bare.adapter";
import { TimeoutRunnerNoopAdapter } from "../src/timeout-runner-noop.adapter";
import * as mocks from "./mocks";

const TimeoutRunner = new TimeoutRunnerNoopAdapter();
const timeout = tools.Duration.Ms(1);
const over = timeout.times(v.parse(tools.MultiplicationFactor, 2));

const inner = new SmsNoopAdapter();
const adapter = new SmsWithTimeoutAdapter({ timeout }, { inner, TimeoutRunner });

describe("SmsWithTimeoutAdapter", () => {
  test("send - success", async () => {
    expect(async () => adapter.send(mocks.sms)).not.toThrow();
  });

  test("send - failure", async () => {
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.send(mocks.sms)).toThrow(mocks.IntentionalError);
  });

  test("send - timeout", async () => {
    jest.useFakeTimers();
    using _ = spyOn(inner, "send").mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, over.ms)),
    );
    const TimeoutRunner = new TimeoutRunnerBareAdapter();
    const adapter = new SmsWithTimeoutAdapter({ timeout }, { inner, TimeoutRunner });

    const result = adapter.send(mocks.sms);
    jest.runAllTimers();

    expect(result).rejects.toThrow("timeout.exceeded");

    jest.useRealTimers();
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
