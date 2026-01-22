import { describe, expect, spyOn, test } from "bun:test";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SecurityContext } from "../src/security-context.vo";
import { SecurityCountermeasureMirageStrategy } from "../src/security-countermeasure-mirage.strategy";
import { SecurityCountermeasureName } from "../src/security-countermeasure-name.vo";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

const rule = new SecurityRulePassStrategy();
const countermeasure = new SecurityCountermeasureMirageStrategy(deps);
const context = new SecurityContext(rule.name, countermeasure.name, mocks.client, undefined);

describe("SecurityCountermeasureMirageStrategy", () => {
  test("happy path", async () => {
    const loggerInfo = spyOn(Logger, "info");

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
    const config = { response: { status: 201 as ContentfulStatusCode } };
    const countermeasure = new SecurityCountermeasureMirageStrategy(deps, config);

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

  test("name", () => {
    expect(countermeasure.name).toEqual(SecurityCountermeasureName.parse("mirage"));
  });
});
