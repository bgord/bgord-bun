import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { TimeoutRunnerMonitorAdapter } from "../src/timeout-runner-monitor.adapter";

const timeout = tools.Duration.MIN;

const over = timeout.times(v.parse(tools.MultiplicationFactor, 10)).ms;

describe("TimeoutRunnerMonitorAdapter", () => {
  test("run - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const adapter = new TimeoutRunnerMonitorAdapter({ Logger });
    const action = async () => 2;

    const result = await adapter.run(action(), timeout);

    expect(result).toEqual(2);
    expect(Logger.entries).toEqual([]);
  });

  test("run - over timeout", async () => {
    jest.useFakeTimers();
    using globalClearTimeout = spyOn(global, "clearTimeout");

    const Logger = new LoggerCollectingAdapter();
    const adapter = new TimeoutRunnerMonitorAdapter({ Logger });
    const action = () => new Promise((resolve) => setTimeout(resolve, over));

    const runner = adapter.run(action(), timeout);
    jest.runAllTimers();
    await runner;

    expect(Logger.entries).toEqual([
      {
        message: "Timeout",
        component: "infra",
        operation: "timeout_monitor",
        metadata: { timeoutMs: timeout.ms },
      },
    ]);
    expect(globalClearTimeout).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
