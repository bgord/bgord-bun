import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../src/clock.port";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import type { UnitOfWork } from "../src/job-handler.strategy";
import { JobHandlerWithLoggerStrategy } from "../src/job-handler-with-logger.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

type Dependencies = { Clock: ClockPort };

class ClockWork implements UnitOfWork {
  constructor(private readonly deps: Dependencies) {}

  static cron = "";

  label = "PassageOfTime";

  async process() {
    this.deps.Clock.now();
  }
}

const Clock = new ClockSystemAdapter();

describe("JobHandlerWithLoggerStrategy", () => {
  test("happy path", async () => {
    const correlationId = mocks.correlationId;
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter([correlationId]);
    const handler = new JobHandlerWithLoggerStrategy({ Logger, Clock, IdProvider });
    const uow = new ClockWork({ Clock });
    const uowProcess = spyOn(uow, "process");

    await handler.handle(uow)();

    expect(Logger.entries).toEqual([
      { message: `${uow.label} start`, component: "infra", operation: "job_handler", correlationId },
      {
        message: `${uow.label} success`,
        component: "infra",
        correlationId,
        metadata: expect.any(tools.Duration),
        operation: "job_handler",
      },
    ]);
    expect(uowProcess).toHaveBeenCalled();
  });

  test("this binding guardrails", async () => {
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
    const handler = new JobHandlerWithLoggerStrategy({ Logger, Clock, IdProvider });

    const uow = new ClockWork({ Clock });
    const loggerError = spyOn(Logger, "error");
    const uowProcess = spyOn(uow, "process");

    await handler.handle(uow)();

    expect(loggerError).not.toHaveBeenCalled();
    expect(uowProcess).toHaveBeenCalled();
  });

  test("failure", async () => {
    const correlationId = mocks.correlationId;
    const Logger = new LoggerCollectingAdapter();
    const IdProvider = new IdProviderDeterministicAdapter([correlationId]);
    const handler = new JobHandlerWithLoggerStrategy({ Logger, Clock, IdProvider });
    const uow = { label: "Test Job", process: mocks.throwIntentionalErrorAsync };

    await handler.handle(uow)();

    expect(Logger.entries).toEqual([
      {
        message: "Test Job start",
        component: "infra",
        operation: "job_handler",
        correlationId,
      },
      {
        message: "Test Job error",
        component: "infra",
        correlationId,
        operation: "job_handler",
        error: new Error(mocks.IntentionalError),
        metadata: expect.any(tools.Duration),
      },
    ]);
  });
});
