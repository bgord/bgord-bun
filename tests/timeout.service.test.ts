import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { Timeout, TimeoutError } from "../src/timeout.service";
import * as mocks from "./mocks";

function delay<T>(value: T, duration: tools.Duration): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), duration.ms));
}

const timeout = tools.Duration.Ms(5);

const logger = new LoggerNoopAdapter();

describe("Timeout", () => {
  test("run - happy path", async () => {
    const action = delay("OK", tools.Duration.Ms(1));

    const result = await Timeout.run(action, timeout);

    expect(result).toEqual("OK");
  });

  test("run - error propagation", async () => {
    const action = Promise.reject(new Error("boom"));

    try {
      await Timeout.run(action, timeout);

      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).toEqual("boom");
    }
  });

  test("run - timeout", async () => {
    const action = delay("LATE", tools.Duration.Ms(10));

    try {
      await Timeout.run(action, timeout);

      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).toEqual(TimeoutError.Exceeded);
    }
  });

  test("cancellable - happy path", async () => {
    const action = (_signal: AbortSignal) => delay("OK", tools.Duration.Ms(1));

    const result = await Timeout.cancellable(action, timeout);

    expect(result).toEqual("OK");
  });

  test("cancellable - error propagation", async () => {
    try {
      await Timeout.cancellable(mocks.throwIntentionalErrorAsync, timeout);

      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).toEqual(mocks.IntentionalError);
    }
  });

  test("cancellable - timeout", async () => {
    let captured: AbortSignal | null = null;
    const action = (signal: AbortSignal) => {
      captured = signal;
      return delay("LATE", tools.Duration.Ms(10));
    };

    try {
      await Timeout.cancellable(action, timeout);

      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).toEqual(TimeoutError.Exceeded);
      expect(captured).not.toBeNull();
      expect(captured!.aborted).toEqual(true);
      expect(captured!.reason.message).toEqual(TimeoutError.Exceeded);
    }
  });

  test("monitor - under timeout", async () => {
    const loggerWarn = spyOn(logger, "warn");
    const action = delay("OK", tools.Duration.Ms(1));

    const result = await Timeout.monitor(action, timeout, logger);

    expect(result).toEqual("OK");
    expect(loggerWarn).not.toHaveBeenCalled();
  });

  test("monitor - over timeout", async () => {
    const loggerWarn = spyOn(logger, "warn");
    const action = delay("OK", tools.Duration.Ms(7));

    const result = await Timeout.monitor(action, timeout, logger);

    expect(result).toEqual("OK");
    expect(loggerWarn).toHaveBeenCalledWith({
      message: "Timeout",
      component: "infra",
      operation: "timeout_monitor",
      metadata: { timeoutMs: timeout.ms },
    });
  });
});
