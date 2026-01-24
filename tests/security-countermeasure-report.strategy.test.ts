import { describe, expect, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityCountermeasureReportStrategy } from "../src/security-countermeasure-report.strategy";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import * as mocks from "./mocks";

const rule = new SecurityRulePassStrategy();

describe("SecurityCountermeasureReportStrategy", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const countermeasure = new SecurityCountermeasureReportStrategy({ Logger });
    const context = new SecurityContext(rule.name, countermeasure.name, mocks.client, undefined);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await countermeasure.execute(context)).toEqual({ kind: "allow" });
    });
    expect(Logger.entries).toEqual([
      {
        message: "Security countermeasure report",
        component: "security",
        operation: "security_countermeasure_report",
        correlationId: mocks.correlationId,
        metadata: context,
      },
    ]);
  });

  test("name", () => {
    const Logger = new LoggerCollectingAdapter();
    const countermeasure = new SecurityCountermeasureReportStrategy({ Logger });

    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("report"));
  });
});
