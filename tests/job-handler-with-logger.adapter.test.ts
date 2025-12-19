import { describe, expect, jest, spyOn, test } from "bun:test";
import type { ClockPort } from "../src/clock.port";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import type { UnitOfWork } from "../src/job-handler.port";
import { JobHandlerWithLogger } from "../src/job-handler-with-logger.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockSystemAdapter();
const IdProvider = new IdProviderCryptoAdapter();
const deps = { Logger, Clock, IdProvider };

const handler = new JobHandlerWithLogger(deps);

type Dependencies = { Clock: ClockPort };

class ClockWork implements UnitOfWork {
  constructor(private readonly deps: Dependencies) {}

  static cron = "";

  label = "PassageOfTime";

  async process() {
    this.deps.Clock.nowMs();
  }
}

describe("JobHandlerWithLogger", () => {
  test("happy path", async () => {
    const uow = new ClockWork(deps);
    const loggerInfo = spyOn(Logger, "info");
    const uowProcess = spyOn(uow, "process");

    await handler.handle(uow)();

    expect(loggerInfo).toHaveBeenNthCalledWith(1, expect.objectContaining({ message: `${uow.label} start` }));
    expect(loggerInfo).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ message: `${uow.label} success` }),
    );
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

    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({ message: "Test Job start" }));
    expect(loggerError).toHaveBeenCalledWith(expect.objectContaining({ message: "Test Job error" }));
  });
});
