import { describe, expect, jest, spyOn, test } from "bun:test";
import { GracefulShutdown } from "../src/graceful-shutdown.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

type ServerType = ReturnType<typeof Bun.serve>;

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

// Helper to wait for promises to settle
const tick = () => new Promise((r) => setTimeout(r, 0));

function setup() {
  const server = { stop: jest.fn() } as unknown as ServerType;
  const exitCalls: number[] = [];
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
    expect(exitCalls[0]).toBe(0);
    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({ message: "SIGTERM received" }));
    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({ message: "HTTP server closed" }));
  });

  test("handles %s correctly", async () => {
    const { server, gs, exitCalls } = setup();
    const loggerInfo = spyOn(Logger, "info");

    gs.applyTo(server);
    process.emit("SIGINT");
    await tick();

    expect(server.stop).toHaveBeenCalled();
    expect(exitCalls[0]).toBe(0);
    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({ message: "SIGINT received" }));
    expect(loggerInfo).toHaveBeenCalledWith(expect.objectContaining({ message: "HTTP server closed" }));
  });

  test("handles unhandledRejection", async () => {
    const { server, gs, exitCalls } = setup();
    const loggerError = spyOn(Logger, "error");

    gs.applyTo(server);
    process.emit("unhandledRejection", new Error("oops"), {} as any);
    await tick();

    expect(exitCalls[0]).toBe(1);
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "UnhandledRejection received" }),
    );
  });

  test("handles uncaughtException", async () => {
    const { server, gs, exitCalls } = setup();
    const loggerError = spyOn(Logger, "error");

    gs.applyTo(server);
    process.emit("uncaughtException", new Error("oops"));
    await tick();

    expect(exitCalls[0]).toBe(1);
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "UncaughtException received" }),
    );
  });

  test("cleanup failure is logged but exit proceeds", async () => {
    const { server, gs, exitCalls } = setup();
    const cleanup = jest.fn().mockRejectedValue(new Error("fail"));
    const loggerError = spyOn(Logger, "error");

    gs.applyTo(server, cleanup);
    process.emit("SIGTERM");
    await tick();
    await tick(); // Extra tick for the promise chain in cleanup

    expect(server.stop).toHaveBeenCalled();
    expect(exitCalls[0]).toBe(0);
    expect(loggerError).toHaveBeenCalledWith(expect.objectContaining({ message: "Cleanup hook failed" }));
  });

  test("idempotency: ignores subsequent signals", async () => {
    const { server, gs, exitCalls } = setup();
    gs.applyTo(server);

    process.emit("SIGINT");
    await tick();
    process.emit("SIGINT");
    await tick();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(exitCalls).toHaveLength(1);
  });
});
