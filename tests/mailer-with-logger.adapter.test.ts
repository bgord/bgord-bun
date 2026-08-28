import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import { MailerWithLoggerAdapter } from "../src/mailer-with-logger.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const cases = testcase.mailer();

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("MailerWithLoggerAdapter", () => {
  test(cases.send.name, async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new MailerNoopAdapter();
    using innerSend = spyOn(inner, "send");
    const adapter = new MailerWithLoggerAdapter({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.correlationId, async () => adapter.send(cases.send.input));

    expect(innerSend).toHaveBeenCalledWith(cases.send.input);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "mailer",
        message: "Mailer attempt",
        correlationId: mocks.correlationId,
        metadata: { template: cases.send.input.toJSON() },
      },
      {
        component: "infra",
        operation: "mailer",
        message: "Mailer success",
        correlationId: mocks.correlationId,
        metadata: { template: cases.send.input.toJSON(), duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("send - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new MailerNoopAdapter();
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new MailerWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.correlationId, async () => adapter.send(mocks.template)),
    ).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "mailer",
        message: "Mailer attempt",
        correlationId: mocks.correlationId,
        metadata: { template: mocks.template.toJSON() },
      },
      {
        component: "infra",
        operation: "mailer",
        message: "Mailer error",
        correlationId: mocks.correlationId,
        error: new Error(mocks.IntentionalError),
        metadata: { duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test(cases.verify.name, async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new MailerNoopAdapter();
    const adapter = new MailerWithLoggerAdapter({ inner, Logger, Clock });

    expect(await adapter.verify()).toEqual(cases.verify.output);
    expect(Logger.entries).toEqual([]);
  });
});
