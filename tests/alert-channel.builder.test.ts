import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AlertChannelBuilder } from "../src/alert-channel.builder";
import { AlertChannelNoopAdapter } from "../src/alert-channel-noop.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import { TimeoutRunnerNoopAdapter } from "../src/timeout-runner-noop.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const Sleeper = new SleeperNoopAdapter();
const TimeoutRunner = new TimeoutRunnerNoopAdapter();

const timeout = tools.Duration.MIN;

const max = tools.Int.positive(3);
const backoff = new RetryBackoffNoopStrategy();
const retry = { max, backoff };

const inner = new AlertChannelNoopAdapter();

describe("AlertChannelBuilder", () => {
  test("build - bare", async () => {
    using innerSend = spyOn(inner, "send");
    const adapter = AlertChannelBuilder.of(inner).build();

    await adapter.send(mocks.alert);

    expect(innerSend).toHaveBeenCalledTimes(1);
  });

  test("build - with logger", async () => {
    const Logger = new LoggerCollectingAdapter();
    const adapter = AlertChannelBuilder.of(inner).withLogger({ Logger, Clock }).build();

    await CorrelationStorage.run(mocks.correlationId, async () => adapter.send(mocks.alert));

    expect(Logger.entries.length).toEqual(2);
  });

  test("build - with retry", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);
    const adapter = AlertChannelBuilder.of(inner).withRetry({ retry }, { Sleeper }).build();

    expect(async () => adapter.send(mocks.alert)).toThrow(mocks.IntentionalError);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("build - with timeout", async () => {
    using runnerRun = spyOn(TimeoutRunner, "run");
    const adapter = AlertChannelBuilder.of(inner).withTimeout({ timeout }, { TimeoutRunner }).build();

    await adapter.send(mocks.alert);

    expect(runnerRun).toHaveBeenCalledTimes(1);
  });

  test("build - all", async () => {
    const inner = new AlertChannelNoopAdapter();
    const adapter = AlertChannelBuilder.of(inner)
      .withTimeout({ timeout }, { TimeoutRunner })
      .withRetry({ retry: { max, backoff } }, { Sleeper })
      .withLogger({ Logger: new LoggerCollectingAdapter(), Clock })
      .build();

    expect(await adapter.verify()).toEqual(true);
  });
});
