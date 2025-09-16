import { describe, expect, jest, spyOn, test } from "bun:test";
import { GracefulShutdown } from "../src/graceful-shutdown.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";

type ServerType = ReturnType<typeof Bun.serve>;

const logger = new LoggerNoopAdapter();

describe("GracefulShutdown", () => {
  test("SIGTERM", async () => {
    const server = { stop: jest.fn() } as unknown as ServerType;

    process.removeAllListeners("SIGTERM");
    const previousExitCode = process.exitCode;
    process.exitCode = undefined;

    const infoSpy = spyOn(logger, "info");

    new GracefulShutdown(logger).applyTo(server);

    process.emit("SIGTERM");
    await Promise.resolve();
    await Promise.resolve();

    expect(server.stop).toHaveBeenCalled();
    expect(process.exitCode).toBe(0 as any);

    expect(infoSpy.mock.calls[0][0].message).toEqual("SIGTERM received");
    expect(infoSpy.mock.calls[1][0].message).toEqual("HTTP server closed");

    process.exitCode = previousExitCode;
  });

  test("SIGINT", async () => {
    const server = { stop: jest.fn() } as unknown as ServerType;

    process.removeAllListeners("SIGINT");
    const previousExitCode = process.exitCode;
    process.exitCode = undefined;

    const infoSpy = spyOn(logger, "info");

    new GracefulShutdown(logger).applyTo(server);

    process.emit("SIGINT");
    await Promise.resolve();
    await Promise.resolve();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toEqual(0 as any);

    expect(infoSpy.mock.calls[0][0].message).toEqual("SIGINT received");
    expect(infoSpy.mock.calls[1][0].message).toEqual("HTTP server closed");

    process.exitCode = previousExitCode;
  });

  test("unhandledRejection", async () => {
    const server = { stop: jest.fn() } as unknown as ServerType;

    process.removeAllListeners("unhandledRejection");
    const previousExitCode = process.exitCode;
    process.exitCode = undefined;

    const errorSpy = spyOn(logger, "error");
    const infoSpy = spyOn(logger, "info");

    new GracefulShutdown(logger).applyTo(server);

    // emit with a harmless second arg to avoid creating a truly unhandled rejected promise
    process.emit("unhandledRejection", new Error("Panic"), {} as any);
    await Promise.resolve();
    await Promise.resolve();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toEqual(1 as any);

    expect(errorSpy.mock.calls[0][0].message).toEqual("UnhandledRejection received");
    expect(infoSpy.mock.calls[0][0].message).toEqual("HTTP server closed");

    process.exitCode = previousExitCode;
  });

  test("uncaughtException", async () => {
    const server = { stop: jest.fn() } as unknown as ServerType;

    process.removeAllListeners("uncaughtException");
    const previousExitCode = process.exitCode;
    process.exitCode = undefined;

    const errorSpy = spyOn(logger, "error");
    const infoSpy = spyOn(logger, "info");

    new GracefulShutdown(logger).applyTo(server);

    process.emit("uncaughtException", new Error("Panic"));
    await Promise.resolve();
    await Promise.resolve();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toEqual(1 as any);

    expect(errorSpy.mock.calls[0][0].message).toEqual("UncaughtException received");
    expect(infoSpy.mock.calls[0][0].message).toEqual("HTTP server closed");

    process.exitCode = previousExitCode;
  });

  test("cleanup failure", async () => {
    const server = { stop: jest.fn() } as unknown as ServerType;

    process.removeAllListeners("SIGTERM");
    const previousExitCode = process.exitCode;
    process.exitCode = undefined;

    const cleanup = jest.fn().mockRejectedValue(new Error("Panic"));

    const infoSpy = spyOn(logger, "info");
    const errorSpy = spyOn(logger, "error");

    new GracefulShutdown(logger).applyTo(server, cleanup);

    process.emit("SIGTERM");
    await Promise.resolve();
    await Promise.resolve();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toEqual(0 as any);

    expect(infoSpy.mock.calls[0][0].message).toEqual("SIGTERM received");
    expect(errorSpy.mock.calls[0][0].message).toEqual("Cleanup hook failed");

    process.exitCode = previousExitCode;
  });

  test("process.once handlers fire only once per signal", async () => {
    const server = { stop: jest.fn() } as unknown as ServerType;

    process.removeAllListeners("SIGINT");
    const previousExitCode = process.exitCode;
    process.exitCode = undefined;

    const cleanup = jest.fn().mockRejectedValue(new Error("Panic"));

    new GracefulShutdown(logger).applyTo(server, cleanup);

    process.emit("SIGINT");
    await Promise.resolve();
    await Promise.resolve();

    process.emit("SIGINT");
    await Promise.resolve();
    await Promise.resolve();

    expect(server.stop).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(1);

    process.exitCode = previousExitCode;
  });
});
