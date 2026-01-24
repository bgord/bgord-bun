import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { TimeoutRunnerMonitorAdapter } from "../src/timeout-runner-monitor.adapter";

const timeout = tools.Duration.MIN;

const over = timeout.times(tools.MultiplicationFactor.parse(10)).ms;

describe("TimeoutRunnerMonitorAdapter", () => {
  test("monitor - under timeout", async () => {
    const Logger = new LoggerCollectingAdapter();
    const adapter = new TimeoutRunnerMonitorAdapter({ Logger });
    const action = async () => 2;

    const result = await adapter.run(action(), timeout);

    expect(result).toEqual(2);
    expect(Logger.entries.length).toEqual(0);
  });

  test("monitor - over timeout", async () => {
    jest.useFakeTimers();
    const globalClearTimeout = spyOn(global, "clearTimeout");

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
