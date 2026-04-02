import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { MailerBuilder } from "../src/mailer.builder";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
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

const inner = new MailerNoopAdapter();

describe("MailerBuilder", () => {
  test("build - bare", async () => {
    using innerSend = spyOn(inner, "send");
    const mailer = MailerBuilder.of(inner).build();

    await mailer.send(mocks.template);

    expect(innerSend).toHaveBeenCalledTimes(1);
  });

  test("build - with logger", async () => {
    const Logger = new LoggerCollectingAdapter();
    const mailer = MailerBuilder.of(inner).withLogger({ Logger, Clock }).build();

    await CorrelationStorage.run(mocks.correlationId, async () => mailer.send(mocks.template));

    expect(Logger.entries.length).toEqual(2);
  });

  test("build - with retry", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);
    const mailer = MailerBuilder.of(inner).withRetry({ retry }, { Sleeper }).build();

    expect(async () => mailer.send(mocks.template)).toThrow(mocks.IntentionalError);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("build - with timeout", async () => {
    using runnerRun = spyOn(TimeoutRunner, "run");
    const mailer = MailerBuilder.of(inner).withTimeout({ timeout }, { TimeoutRunner }).build();

    await mailer.send(mocks.template);

    expect(runnerRun).toHaveBeenCalledTimes(1);
  });

  test("build - all", async () => {
    const inner = new MailerNoopAdapter();
    const mailer = MailerBuilder.of(inner)
      .withTimeout({ timeout }, { TimeoutRunner })
      .withRetry({ retry: { max, backoff } }, { Sleeper })
      .withLogger({ Logger: new LoggerCollectingAdapter(), Clock })
      .build();

    expect(await mailer.verify()).toEqual(true);
  });
});
