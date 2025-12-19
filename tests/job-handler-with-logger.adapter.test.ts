import { describe, expect, jest, spyOn, test } from "bun:test";
import * as croner from "croner";
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

describe("JobHandler service", () => {
  test("happy path", async () => {
    // @ts-expect-error
    spyOn(croner, "Cron").mockImplementation(() => ({
      isRunning: jest.fn().mockReturnValue(false),
      stop: jest.fn(),
    }));
    const loggerInfo = spyOn(Logger, "info").mockImplementation(jest.fn());

    await handler.handle({ label: "Test Job", process: jest.fn() })();

    expect(loggerInfo).toHaveBeenNthCalledWith(1, expect.objectContaining({ message: "Test Job start" }));
    expect(loggerInfo).toHaveBeenNthCalledWith(2, expect.objectContaining({ message: "Test Job success" }));
  });

  test("this binding guardrails", async () => {
    const loggerError = spyOn(Logger, "error");
    const uow = new ClockWork(deps);

    await handler.handle(uow)();

    expect(loggerError).not.toHaveBeenCalled();
  });

  test("failure", async () => {
    // @ts-expect-error
    spyOn(croner, "Cron").mockImplementation(() => ({
      isRunning: jest.fn().mockReturnValue(false),
      stop: jest.fn(),
    }));
    const loggerInfo = spyOn(Logger, "info").mockImplementation(jest.fn());
    const loggerError = spyOn(Logger, "error").mockImplementation(jest.fn());

    await handler.handle({
      label: "Test Job",
      process: jest.fn().mockRejectedValue(new Error(mocks.IntentionalError)),
    })();

    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({ message: "Test Job start" }));
    expect(loggerError).toHaveBeenCalledWith(expect.objectContaining({ message: "Test Job error" }));
  });
});
