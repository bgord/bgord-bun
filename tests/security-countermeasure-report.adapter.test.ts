import { describe, expect, spyOn, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import {
  SecurityCountermeasureReportAdapter,
  SecurityCountermeasureReportAdapterError,
} from "../src/security-countermeasure-report.adapter";
import * as mocks from "./mocks";

const context = { client: { ip: "anon", ua: "anon" } };

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

const countermeasure = new SecurityCountermeasureReportAdapter(deps);

describe("SecurityCountermeasureReportAdapter", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(async () => countermeasure.execute(context)).toThrow(
        SecurityCountermeasureReportAdapterError.Executed,
      );
    });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure report",
      component: "security",
      operation: "security_countermeasure_report",
      correlationId: mocks.correlationId,
      metadata: context,
    });
  });
});
