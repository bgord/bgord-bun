import { describe, expect, jest, spyOn, test } from "bun:test";
import { GracefulShutdown } from "../src/graceful-shutdown.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

type ServerType = ReturnType<typeof Bun.serve>;

const tick = async (times = 2) => {
  for (let i = 0; i < times; i++) {
    await new Promise((r) => setTimeout(r, 0));
  }
};

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

function setup() {
  const server = { stop: jest.fn() } as unknown as ServerType;
  const exitCalls: number[] = [];
  const exitFn = ((code: number) => exitCalls.push(code)) as unknown as (code: number) => never;

  return { server, gs: new GracefulShutdown(deps, exitFn), exitCalls };
}

describe("GracefulShutdown service", () => {
  test("SIGTERM", async () => {
    const { server, gs, exitCalls } = setup();
    process.removeAllListeners("SIGTERM");
    const loggerInfo = spyOn(Logger, "info");
    gs.applyTo(server);

    process.emit("SIGTERM");
    await tick();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(exitCalls[0]).toEqual(0);
    expect(loggerInfo.mock.calls?.[0]?.[0].message).toEqual("SIGTERM received");
    expect(loggerInfo.mock.calls?.[1]?.[0].message).toEqual("HTTP server closed");
  });

  test("SIGINT", async () => {
    const { server, gs, exitCalls } = setup();
    process.removeAllListeners("SIGINT");
    const loggerInfo = spyOn(Logger, "info");
    gs.applyTo(server);

    process.emit("SIGINT");
    await tick();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(exitCalls[0]).toEqual(0);
    expect(loggerInfo.mock.calls?.[0]?.[0].message).toEqual("SIGINT received");
    expect(loggerInfo.mock.calls?.[1]?.[0].message).toEqual("HTTP server closed");
  });

  test("unhandledRejection", async () => {
    const { server, gs, exitCalls } = setup();
    process.removeAllListeners("unhandledRejection");
    const loggerError = spyOn(Logger, "error");
    const loggerInfo = spyOn(Logger, "info");
    gs.applyTo(server);

    process.emit("unhandledRejection", new Error("Panic"), {} as any);
    await tick();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(exitCalls[0]).toEqual(1);
    expect(loggerError.mock.calls?.[0]?.[0].message).toEqual("UnhandledRejection received");
    expect(loggerInfo.mock.calls?.[0]?.[0].message).toEqual("HTTP server closed");
  });

  test("uncaughtException", async () => {
    const { server, gs, exitCalls } = setup();
    process.removeAllListeners("uncaughtException");
    const loggerError = spyOn(Logger, "error");
    const loggerInfo = spyOn(Logger, "info");
    gs.applyTo(server);

    process.emit("uncaughtException", new Error("Panic"));
    await tick();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(exitCalls[0]).toEqual(1);
    expect(loggerError.mock.calls?.[0]?.[0].message).toEqual("UncaughtException received");
    expect(loggerInfo.mock.calls?.[0]?.[0].message).toEqual("HTTP server closed");
  });

  test("cleanup failure still exits and logs error", async () => {
    const { server, gs, exitCalls } = setup();
    process.removeAllListeners("SIGTERM");
    const cleanup = jest.fn().mockRejectedValue(new Error("Panic"));
    const loggerInfo = spyOn(Logger, "info");
    const loggerError = spyOn(Logger, "error");
    gs.applyTo(server, cleanup);

    process.emit("SIGTERM");
    await tick();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(exitCalls[0]).toEqual(0);
    expect(loggerInfo.mock.calls?.[0]?.[0].message).toEqual("SIGTERM received");
    expect(loggerError.mock.calls?.[0]?.[0].message).toEqual("Cleanup hook failed");
  });

  test("handlers run only once per shutdown", async () => {
    const { server, gs, exitCalls } = setup();
    process.removeAllListeners("SIGINT");
    const cleanup = jest.fn().mockResolvedValue(undefined);
    gs.applyTo(server, cleanup);

    process.emit("SIGINT");
    await tick();

    process.emit("SIGINT");
    await tick();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(exitCalls.length).toEqual(1);
  });
});
