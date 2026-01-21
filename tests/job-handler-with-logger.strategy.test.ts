import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../src/clock.port";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import type { UnitOfWork } from "../src/job-handler.strategy";
import { JobHandlerWithLoggerStrategy } from "../src/job-handler-with-logger.strategy";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockSystemAdapter();
const IdProvider = new IdProviderCryptoAdapter();
const deps = { Logger, Clock, IdProvider };

const handler = new JobHandlerWithLoggerStrategy(deps);

type Dependencies = { Clock: ClockPort };

class ClockWork implements UnitOfWork {
  constructor(private readonly deps: Dependencies) {}

  static cron = "";

  label = "PassageOfTime";

  async process() {
    this.deps.Clock.now();
  }
}

describe("JobHandlerWithLoggerStrategy", () => {
  test("happy path", async () => {
    const uow = new ClockWork(deps);
    const loggerInfo = spyOn(Logger, "info");
    const uowProcess = spyOn(uow, "process");

    await handler.handle(uow)();

    expect(loggerInfo).toHaveBeenNthCalledWith(1, {
      message: `${uow.label} start`,
      component: "infra",
      operation: "job_handler",
      correlationId: expect.any(String),
    });
    expect(loggerInfo).toHaveBeenNthCalledWith(2, {
      message: `${uow.label} success`,
      component: "infra",
      correlationId: expect.any(String),
      // @ts-expect-error Private constructor assertion
      metadata: expect.any(tools.Duration),
      operation: "job_handler",
    });
    expect(uowProcess).toHaveBeenCalled();
  });

  test("this binding guardrails", async () => {
    const uow = new ClockWork(deps);
    const loggerError = spyOn(Logger, "error");
    const uowProcess = spyOn(uow, "process");

    await handler.handle(uow)();

    expect(loggerError).not.toHaveBeenCalled();
    expect(uowProcess).toHaveBeenCalled();
  });

  test("failure", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const loggerError = spyOn(Logger, "error");
    const uow = { label: "Test Job", process: mocks.throwIntentionalErrorAsync };

    await handler.handle(uow)();

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Test Job start",
      component: "infra",
      operation: "job_handler",
      correlationId: expect.any(String),
    });
    expect(loggerError).toHaveBeenCalledWith({
      message: "Test Job error",
      component: "infra",
      correlationId: expect.any(String),
      operation: "job_handler",
      error: new Error(mocks.IntentionalError),
      // @ts-expect-error Private constructor assertion
      metadata: expect.any(tools.Duration),
    });
  });
});
