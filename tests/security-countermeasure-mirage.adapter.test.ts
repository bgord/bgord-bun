import { describe, expect, spyOn, test } from "bun:test";
import { Client } from "../src/client.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureMirageAdapter } from "../src/security-countermeasure-mirage.adapter";
import { SecurityRuleNoopAdapter } from "../src/security-rule-noop.adapter";
import * as mocks from "./mocks";

const rule = new SecurityRuleNoopAdapter();
const context = new SecurityContext(rule.name, Client.fromParts("anon", "anon"), undefined);

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

const countermeasure = new SecurityCountermeasureMirageAdapter(deps);

describe("SecurityCountermeasureMirageAdapter", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await new SecurityCountermeasureMirageAdapter(deps).execute(context)).toEqual({
        kind: "mirage",
        response: { status: 200 },
      });
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

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await new SecurityCountermeasureMirageAdapter(deps, { status: 201 }).execute(context)).toEqual({
        kind: "mirage",
        response: { status: 201 },
      });
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
