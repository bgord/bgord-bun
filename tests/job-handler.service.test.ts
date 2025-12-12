import { describe, expect, jest, spyOn, test } from "bun:test";
import * as croner from "croner";
import { ClockSystemAdapter } from "../src/clock-system.adapter";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import { JobHandler } from "../src/job-handler.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockSystemAdapter();
const IdProvider = new IdProviderCryptoAdapter();

const deps = { Logger, Clock, IdProvider };

const handler = new JobHandler(deps);

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
      process: jest.fn().mockRejectedValue(new Error(mocks.IntentialError)),
    })();

    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({ message: "Test Job start" }));
    expect(loggerError).toHaveBeenCalledWith(expect.objectContaining({ message: "Test Job error" }));
  });

  test("overrun", async () => {
    const loggerInfo = spyOn(Logger, "info").mockImplementation(jest.fn());

    await handler.protect({} as croner.Cron)();

    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({ message: "undefined overrun" }));
  });
});
