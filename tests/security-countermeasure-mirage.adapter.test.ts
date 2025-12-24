import { describe, expect, spyOn, test } from "bun:test";
import { Client } from "../src/client.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureMirageAdapter } from "../src/security-countermeasure-mirage.adapter";
import { SecurityRulePassAdapter } from "../src/security-rule-pass.adapter";
import * as mocks from "./mocks";

const rule = new SecurityRulePassAdapter();
const context = new SecurityContext(rule.name, Client.fromParts("anon", "anon"), undefined);

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

describe("SecurityCountermeasureMirageAdapter", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const countermeasure = new SecurityCountermeasureMirageAdapter(deps);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({ kind: "mirage", response: { status: 200 } });
    });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure mirage",
      component: "security",
      operation: "security_countermeasure_mirage",
      correlationId: mocks.correlationId,
      metadata: context,
    });
  });

  test("happy path - custom status", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const config = { response: { status: 201 } };
    const countermeasure = new SecurityCountermeasureMirageAdapter(deps, config);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({ kind: "mirage", ...config });
    });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure mirage",
      component: "security",
      operation: "security_countermeasure_mirage",
      correlationId: mocks.correlationId,
      metadata: context,
    });
  });
});
