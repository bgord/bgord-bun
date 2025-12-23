import { describe, expect, spyOn, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import {
  SecurityCountermeasureMirageAdapter,
  SecurityCountermeasureMirageAdapterError,
} from "../src/security-countermeasure-mirage.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const deps = { Logger };
const countermeasure = new SecurityCountermeasureMirageAdapter(deps);

describe("SecurityCountermeasureMirageAdapter", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(async () => countermeasure.execute()).toThrow(SecurityCountermeasureMirageAdapterError.Executed);
    });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure mirage",
      component: "security",
      operation: "security_countermeasure_mirage",
      correlationId: mocks.correlationId,
    });
  });
});
