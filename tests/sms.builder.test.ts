import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import { SmsBuilder } from "../src/sms.builder";
import { SmsNoopAdapter } from "../src/sms-noop.adapter";
import { TimeoutRunnerNoopAdapter } from "../src/timeout-runner-noop.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const Sleeper = new SleeperNoopAdapter();
const TimeoutRunner = new TimeoutRunnerNoopAdapter();

const timeout = tools.Duration.MIN;

const max = tools.Int.positive(3);
const backoff = new RetryBackoffNoopStrategy();
const retry = { max, backoff };

const inner = new SmsNoopAdapter();

describe("SmsBuilder", () => {
  test("build - bare", async () => {
    using innerSend = spyOn(inner, "send");
    const sms = SmsBuilder.of(inner).build();

    await sms.send(mocks.sms);

    expect(innerSend).toHaveBeenCalledTimes(1);
  });

  test("build - with logger", async () => {
    const Logger = new LoggerCollectingAdapter();
    const sms = SmsBuilder.of(inner).withLogger({ Logger, Clock }).build();

    await CorrelationStorage.run(mocks.correlationId, async () => sms.send(mocks.sms));

    expect(Logger.entries.length).toEqual(2);
  });

  test("build - with retry", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);
    const sms = SmsBuilder.of(inner).withRetry({ retry }, { Sleeper }).build();

    expect(async () => sms.send(mocks.sms)).toThrow(mocks.IntentionalError);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("build - with timeout", async () => {
    using runnerRun = spyOn(TimeoutRunner, "run");
    const sms = SmsBuilder.of(inner).withTimeout({ timeout }, { TimeoutRunner }).build();

    await sms.send(mocks.sms);

    expect(runnerRun).toHaveBeenCalledTimes(1);
  });

  test("build - all", async () => {
    const inner = new SmsNoopAdapter();
    const sms = SmsBuilder.of(inner)
      .withTimeout({ timeout }, { TimeoutRunner })
      .withRetry({ retry: { max, backoff } }, { Sleeper })
      .withLogger({ Logger: new LoggerCollectingAdapter(), Clock })
      .build();

    expect(await sms.verify()).toEqual(true);
  });
});
