import { describe, expect, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureMirageStrategy } from "../src/security-countermeasure-mirage.strategy";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import * as mocks from "./mocks";

const rule = new SecurityRulePassStrategy();

describe("SecurityCountermeasureMirageStrategy", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const countermeasure = new SecurityCountermeasureMirageStrategy({ Logger });
    const context = new SecurityContext(rule.name, countermeasure.name, mocks.client, undefined);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({ kind: "mirage", response: { status: 200 } });
    });

    expect(Logger.entries).toEqual([
      {
        message: "Security countermeasure mirage",
        component: "security",
        operation: "security_countermeasure_mirage",
        correlationId: mocks.correlationId,
        metadata: context,
      },
    ]);
  });

  test("happy path - custom status", async () => {
    const config = { response: { status: 201 } };
    const Logger = new LoggerCollectingAdapter();
    const countermeasure = new SecurityCountermeasureMirageStrategy({ Logger }, config);
    const context = new SecurityContext(rule.name, countermeasure.name, mocks.client, undefined);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({ kind: "mirage", ...config });
    });

    expect(Logger.entries).toEqual([
      {
        message: "Security countermeasure mirage",
        component: "security",
        operation: "security_countermeasure_mirage",
        correlationId: mocks.correlationId,
        metadata: context,
      },
    ]);
  });

  test("name", () => {
    const Logger = new LoggerCollectingAdapter();
    const countermeasure = new SecurityCountermeasureMirageStrategy({ Logger });

    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("mirage"));
  });
});
