import { afterEach, beforeEach, describe, expect, jest, test } from "bun:test";

import { GracefulShutdown } from "../src/graceful-shutdown";

describe("graceful shutdown", () => {
  beforeEach(() => {
    // @ts-expect-error
    process.exit = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => jest.restoreAllMocks());

  test("gracefully shuts down on SIGINT", async () => {
    const stop = jest.fn();
    const callback = jest.fn();

    const mockServer = { stop };

    // @ts-expect-error
    GracefulShutdown.applyTo(mockServer, callback);

    try {
      process.emit("SIGINT");
    } catch (_) {}

    expect(stop).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  test("gracefully shuts down on SIGTERM", async () => {
    const stop = jest.fn();
    const callback = jest.fn();

    const mockServer = { stop };

    // @ts-expect-error
    GracefulShutdown.applyTo(mockServer, callback);

    try {
      process.emit("SIGTERM");
    } catch (_) {}

    expect(stop).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  test("handles unhandledRejection and exits with code 1", async () => {
    const stop = jest.fn();
    const callback = jest.fn();

    const mockServer = { stop };

    //@ts-expect-error
    GracefulShutdown.applyTo(mockServer, callback);

    try {
      //@ts-expect-error
      process.emit("unhandledRejection", new Error("oops"));
    } catch (_) {}

    expect(stop).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });
});
