import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { TimeoutRunnerMonitorAdapter } from "../src/timeout-runner-monitor.adapter";

const immediate = async () => 2;
const timeout = tools.Duration.Ms(1);
const Logger = new LoggerNoopAdapter();
const deps = { Logger };
const adapter = new TimeoutRunnerMonitorAdapter(deps);

describe("TimeoutRunnerWithLoggerAdapter", () => {
  test("monitor - under timeout", async () => {
    const loggerWarn = spyOn(Logger, "warn");

    const result = await adapter.run(immediate(), timeout);

    expect(result).toEqual(2);
    expect(loggerWarn).not.toHaveBeenCalled();
  });

  test("monitor - over timeout", async () => {
    const loggerWarn = spyOn(Logger, "warn");
    const action = {
      run: async () => {
        await Bun.sleep(timeout.times(tools.MultiplicationFactor.parse(5)).ms);
        return 2;
      },
    };

    const result = await adapter.run(action.run(), timeout);

    expect(result).toEqual(2);
    expect(loggerWarn).toHaveBeenCalledWith({
      message: "Timeout",
      component: "infra",
      operation: "timeout_monitor",
      metadata: { timeoutMs: timeout.ms },
    });
  });
});
