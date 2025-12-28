import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Client } from "../src/client.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityCountermeasureTarpitStrategy } from "../src/security-countermeasure-tarpit.strategy";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import * as mocks from "./mocks";

const rule = new SecurityRulePassStrategy();
const context = new SecurityContext(rule.name, Client.fromParts("anon", "anon"), undefined);

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

const config = { duration: tools.Duration.Seconds(5), after: { kind: "allow" } as const };
const countermeasure = new SecurityCountermeasureTarpitStrategy(deps, config);

describe("SecurityCountermeasureTarpitStrategy", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const action = await countermeasure.execute(context);

      expect(action).toEqual({ kind: "delay", ...config });
    });

    expect(loggerInfo).toHaveBeenCalledWith({
      message: "Security countermeasure tarpit",
      component: "security",
      operation: "security_countermeasure_tarpit",
      correlationId: mocks.correlationId,
      metadata: context,
    });
  });

  test("name", () => {
    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("tarpit"));
  });
});
