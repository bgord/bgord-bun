import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MaintenanceModeMiddleware } from "../src/maintenance-mode.middleware";

describe("MaintenanceModeMiddleware", () => {
  test("enabled - default retry after", () => {
    const middleware = new MaintenanceModeMiddleware({ enabled: true });

    const result = middleware.evaluate();

    expect(result.enabled).toEqual(true);
    expect(result.RetryAfter.seconds).toEqual(tools.Duration.Hours(1).seconds);
  });

  test("enabled - custom retry after", () => {
    const RetryAfter = tools.Duration.Hours(2);
    const middleware = new MaintenanceModeMiddleware({ enabled: true, RetryAfter });

    const result = middleware.evaluate();

    expect(result.enabled).toEqual(true);
    expect(result.RetryAfter.seconds).toEqual(RetryAfter.seconds);
  });

  test("disabled", () => {
    const middleware = new MaintenanceModeMiddleware({ enabled: false });

    const result = middleware.evaluate();

    expect(result.enabled).toEqual(false);
    expect(result.RetryAfter.seconds).toEqual(tools.Duration.Hours(1).seconds);
  });

  test("no config - disabled by default", () => {
    const middleware = new MaintenanceModeMiddleware();

    expect(middleware.evaluate().enabled).toEqual(false);
  });
});
