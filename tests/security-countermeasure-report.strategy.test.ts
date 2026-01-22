import { describe, expect, spyOn, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityCountermeasureReportStrategy } from "../src/security-countermeasure-report.strategy";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

const rule = new SecurityRulePassStrategy();
const countermeasure = new SecurityCountermeasureReportStrategy(deps);
const context = new SecurityContext(rule.name, countermeasure.name, mocks.client, undefined);

describe("SecurityCountermeasureReportStrategy", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({ kind: "allow" });
    });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure report",
      component: "security",
      operation: "security_countermeasure_report",
      correlationId: mocks.correlationId,
      metadata: context,
    });
  });

  test("name", () => {
    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("report"));
  });
});
