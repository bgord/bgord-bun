import { describe, expect, jest, spyOn, test } from "bun:test";
import { GracefulShutdown } from "../src/graceful-shutdown.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import * as mocks from "./mocks";

type ServerType = ReturnType<typeof Bun.serve>;

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

// Helper to wait for promises to settle
const tick = () => new Promise((r) => setTimeout(r, 0));

function setup() {
  const server = { stop: jest.fn() } as unknown as ServerType;
  const exitCalls: Array<number> = [];
  const exitFn = ((code: number) => exitCalls.push(code)) as unknown as (code: number) => never;
  const gs = new GracefulShutdown(deps, exitFn);

  return { server, gs, exitCalls };
}

describe("GracefulShutdown service", () => {
  test("handles SIGTERM correctly", async () => {
    const { server, gs, exitCalls } = setup();
    const loggerInfo = spyOn(Logger, "info");

    gs.applyTo(server);
    process.emit("SIGTERM");
    await tick();

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
    const { server, gs, exitCalls } = setup();
    const loggerInfo = spyOn(Logger, "info");

    gs.applyTo(server);
    process.emit("SIGINT");
    await tick();

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
    const { server, gs, exitCalls } = setup();
    const loggerError = spyOn(Logger, "error");
    gs.applyTo(server);

    process.emit("unhandledRejection", new Error(mocks.IntentionalError), {});
    await tick();

    expect(exitCalls[0]).toEqual(1);
    expect(loggerError).toHaveBeenCalledWith({
      message: "UnhandledRejection received",
      operation: "shutdown",
      component: "infra",
      error: new Error(mocks.IntentionalError),
    });
  });

  test("handles uncaughtException", async () => {
    const { server, gs, exitCalls } = setup();
    const loggerError = spyOn(Logger, "error");
    gs.applyTo(server);

    process.emit("uncaughtException", new Error(mocks.IntentionalError));
    await tick();

    expect(exitCalls[0]).toEqual(1);
    expect(loggerError).toHaveBeenCalledWith({
      message: "UncaughtException received",
      operation: "shutdown",
      component: "infra",
      error: new Error(mocks.IntentionalError),
    });
  });

  test("cleanup failure", async () => {
    const { server, gs, exitCalls } = setup();
    const cleanup = jest.fn().mockRejectedValue(new Error(mocks.IntentionalError));
    const loggerError = spyOn(Logger, "error");
    gs.applyTo(server, cleanup);

    process.emit("SIGTERM");
    await tick();
    await tick(); // Extra tick for the promise chain in cleanup

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
    const loggerInfo = spyOn(Logger, "info");
    spyOn(server, "stop").mockImplementation(mocks.throwIntentionalError);
    gs.applyTo(server);

    process.emit("SIGTERM");
    await tick();

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
    spyOn(server, "stop").mockImplementation(mocks.throwIntentionalError);
    const loggerError = spyOn(Logger, "error");
    gs.applyTo(server);

    process.emit("SIGTERM");
    await tick();

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
    await tick();

    expect(exitCalls[0]).toEqual(1);
  });
});
