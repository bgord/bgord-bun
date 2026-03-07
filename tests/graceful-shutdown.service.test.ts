import { afterEach, describe, expect, jest, spyOn, test } from "bun:test";
import { GracefulShutdown } from "../src/graceful-shutdown.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

type ServerType = ReturnType<typeof Bun.serve>;

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

// Helper to wait for multiple promise cycles
const tick = async (times = 1) => {
  for (let i = 0; i < times; i++) {
    await new Promise((r) => setImmediate(r));
  }
};

function setup() {
  const server = { stop: jest.fn() } as unknown as ServerType;
  const exitCalls: Array<number> = [];
  const exitFn = ((code: number) => {
    exitCalls.push(code);
    // Don't actually exit, but also don't throw - just return undefined
    return undefined as never;
  }) as (code: number) => never;
  const gs = new GracefulShutdown(deps, exitFn);

  return { server, gs, exitCalls };
}

// Clean up all listeners after each test
afterEach(async () => {
  await tick(3); // Give time for any pending promises
  process.removeAllListeners("SIGTERM");
  process.removeAllListeners("SIGINT");
  process.removeAllListeners("unhandledRejection");
  process.removeAllListeners("uncaughtException");
});

describe("GracefulShutdown", () => {
  test("handles SIGTERM correctly", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const { server, gs, exitCalls } = setup();

    gs.applyTo(server);
    process.emit("SIGTERM");
    await tick(3);

    expect(server.stop).toHaveBeenCalled();
    expect(exitCalls[0]).toEqual(0);
    expect(loggerInfo).toHaveBeenCalledWith({
      message: "SIGTERM received",
      operation: "shutdown",
      component: "infra",
    });
    expect(loggerInfo).toHaveBeenCalledWith({
      message: "HTTP server closed",
      operation: "shutdown",
      component: "infra",
    });
  });

  test("handles SIGINT correctly", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const { server, gs, exitCalls } = setup();

    gs.applyTo(server);
    process.emit("SIGINT");
    await tick(3);

    expect(server.stop).toHaveBeenCalled();
    expect(exitCalls[0]).toEqual(0);
    expect(loggerInfo).toHaveBeenCalledWith({
      message: "SIGINT received",
      operation: "shutdown",
      component: "infra",
    });
    expect(loggerInfo).toHaveBeenCalledWith({
      message: "HTTP server closed",
      operation: "shutdown",
      component: "infra",
    });
  });

  test("handles unhandledRejection", async () => {
    using loggerError = spyOn(Logger, "error");
    const { server, gs, exitCalls } = setup();
    gs.applyTo(server);

    process.emit("unhandledRejection", new Error(mocks.IntentionalError), {});
    await tick(3);

    expect(exitCalls[0]).toEqual(1);
    expect(loggerError).toHaveBeenCalledWith({
      message: "UnhandledRejection received",
      operation: "shutdown",
      component: "infra",
      error: new Error(mocks.IntentionalError),
    });
  });

  test("handles uncaughtException", async () => {
    using loggerError = spyOn(Logger, "error");
    const { server, gs, exitCalls } = setup();
    gs.applyTo(server);

    process.emit("uncaughtException", new Error(mocks.IntentionalError));
    await tick(3);

    expect(exitCalls[0]).toEqual(1);
    expect(loggerError).toHaveBeenCalledWith({
      message: "UncaughtException received",
      operation: "shutdown",
      component: "infra",
      error: new Error(mocks.IntentionalError),
    });
  });

  test("cleanup failure", async () => {
    using loggerError = spyOn(Logger, "error");
    const { server, gs, exitCalls } = setup();
    const cleanup = jest.fn().mockRejectedValue(new Error(mocks.IntentionalError));
    gs.applyTo(server, cleanup);

    process.emit("SIGTERM");
    await tick(5); // More ticks for the promise chain

    expect(server.stop).toHaveBeenCalled();
    expect(exitCalls[0]).toEqual(0);
    expect(loggerError).toHaveBeenCalledWith({
      message: "Cleanup hook failed",
      operation: "shutdown",
      component: "infra",
      error: new Error(mocks.IntentionalError),
    });
  });

  test("idempotency", async () => {
    const { server, gs, exitCalls } = setup();
    using _ = spyOn(server, "stop").mockImplementation(mocks.throwIntentionalError);
    using loggerInfo = spyOn(Logger, "info");
    gs.applyTo(server);

    process.emit("SIGTERM");
    await tick(3);

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(exitCalls).toHaveLength(1);
    expect(loggerInfo).toHaveBeenNthCalledWith(1, {
      message: "SIGTERM received",
      component: "infra",
      operation: "shutdown",
    });
    expect(loggerInfo).toHaveBeenNthCalledWith(2, {
      message: "HTTP server closed",
      component: "infra",
      operation: "shutdown",
    });
  });

  test("server stop failure", async () => {
    const { server, gs } = setup();
    using _ = spyOn(server, "stop").mockImplementation(mocks.throwIntentionalError);
    using loggerError = spyOn(Logger, "error");
    gs.applyTo(server);

    process.emit("SIGTERM");
    await tick(3);

    expect(loggerError).toHaveBeenCalledWith({
      message: "Server stop failed",
      operation: "shutdown",
      component: "infra",
      error: new Error(mocks.IntentionalError),
    });
  });

  test("unhandledRejection - exit code", async () => {
    const { server, gs, exitCalls } = setup();
    gs.applyTo(server);

    process.emit("unhandledRejection", "reason");
    await tick(3);

    expect(exitCalls[0]).toEqual(1);
  });
});
