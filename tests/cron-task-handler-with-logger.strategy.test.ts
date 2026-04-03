import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { CronTaskHandlerWithLoggerStrategy } from "../src/cron-task-handler-with-logger.strategy";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const Clock = new ClockSystemAdapter();

describe("CronTaskHandlerWithLoggerStrategy", () => {
  test("happy path", async () => {
    using task = spyOn(mocks.task, "handler");
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const handler = new CronTaskHandlerWithLoggerStrategy({ Logger, Clock, IdProvider });

    await handler.handle(mocks.task).handler();

    expect(Logger.entries).toEqual([
      {
        message: `${mocks.task.label} start`,
        component: "infra",
        operation: "cron_task_handler",
        correlationId: mocks.correlationId,
      },
      {
        message: `${mocks.task.label} success`,
        component: "infra",
        correlationId: mocks.correlationId,
        metadata: { duration: expect.any(tools.Duration) },
        operation: "cron_task_handler",
      },
    ]);
    expect(task).toHaveBeenCalled();
  });

  test("this binding guardrails", async () => {
    using task = spyOn(mocks.task, "handler");
    const Logger = new LoggerCollectingAdapter();
    using loggerError = spyOn(Logger, "error");
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const handler = new CronTaskHandlerWithLoggerStrategy({ Logger, Clock, IdProvider });

    await handler.handle(mocks.task).handler();

    expect(loggerError).not.toHaveBeenCalled();
    expect(task).toHaveBeenCalled();
  });

  test("failure", async () => {
    using _ = spyOn(mocks.task, "handler").mockImplementation(mocks.throwIntentionalErrorAsync);
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const handler = new CronTaskHandlerWithLoggerStrategy({ Logger, Clock, IdProvider });

    expect(async () => handler.handle(mocks.task).handler()).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        message: "cron start",
        component: "infra",
        operation: "cron_task_handler",
        correlationId: mocks.correlationId,
      },
      {
        message: "cron error",
        component: "infra",
        correlationId: mocks.correlationId,
        operation: "cron_task_handler",
        error: new Error(mocks.IntentionalError),
        metadata: { duration: expect.any(tools.Duration) },
      },
    ]);
  });
});
