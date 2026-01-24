import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityCountermeasureTarpitStrategy } from "../src/security-countermeasure-tarpit.strategy";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import * as mocks from "./mocks";

const rule = new SecurityRulePassStrategy();

const config = { duration: tools.Duration.Seconds(5), after: { kind: "allow" } as const };

describe("SecurityCountermeasureTarpitStrategy", () => {
  test("happy path", async () => {
    const Logger = new LoggerCollectingAdapter();
    const countermeasure = new SecurityCountermeasureTarpitStrategy({ Logger }, config);
    const context = new SecurityContext(rule.name, countermeasure.name, mocks.client, undefined);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await countermeasure.execute(context)).toEqual({ kind: "delay", ...config });
    });
    expect(Logger.entries).toEqual([
      {
        message: "Security countermeasure tarpit",
        component: "security",
        operation: "security_countermeasure_tarpit",
        correlationId: mocks.correlationId,
        metadata: context,
      },
    ]);
  });

  test("name", () => {
    const Logger = new LoggerCollectingAdapter();
    const countermeasure = new SecurityCountermeasureTarpitStrategy({ Logger }, config);

    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("tarpit"));
  });
});
