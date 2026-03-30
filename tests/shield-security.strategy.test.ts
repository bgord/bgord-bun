import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventStoreCollectingAdapter } from "../src/event-store-collecting.adapter";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import type { SecurityViolationDetectedEventType } from "../src/modules/system/events/SECURITY_VIOLATION_DETECTED_EVENT";
import { SecurityCountermeasureBanStrategy } from "../src/security-countermeasure-ban.strategy";
import { SecurityCountermeasureMirageStrategy } from "../src/security-countermeasure-mirage.strategy";
import { SecurityCountermeasureNoopStrategy } from "../src/security-countermeasure-noop.strategy";
import { SecurityCountermeasureTarpitStrategy } from "../src/security-countermeasure-tarpit.strategy";
import { SecurityPolicy } from "../src/security-policy.vo";
import { SecurityRuleFailStrategy } from "../src/security-rule-fail.strategy";
import { SecurityRulePassStrategy } from "../src/security-rule-pass.strategy";
import { ShieldSecurityStrategy } from "../src/shield-security.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const Logger = new LoggerNoopAdapter();
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Logger, Clock };

const pass = new SecurityRulePassStrategy();
const fail = new SecurityRuleFailStrategy();

const noop = new SecurityCountermeasureNoopStrategy();

const context = new RequestContextBuilder().withPath("/ping").build();

const duration = tools.Duration.Seconds(5);

describe("ShieldSecurityStrategy", () => {
  test("no violation", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const strategy = new ShieldSecurityStrategy([new SecurityPolicy(pass, noop)]);

    expect(await strategy.evaluate(context)).toEqual(null);
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("allow", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const strategy = new ShieldSecurityStrategy([new SecurityPolicy(fail, noop)]);

    expect(await strategy.evaluate(context)).toEqual({ kind: "allow" });
    expect(loggerInfo).not.toHaveBeenCalled();
  });

  test("deny", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const EventStore = new EventStoreCollectingAdapter<SecurityViolationDetectedEventType>();
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    const ban = new SecurityCountermeasureBanStrategy({ ...deps, EventStore, IdProvider });
    const strategy = new ShieldSecurityStrategy([new SecurityPolicy(fail, ban)]);
    const context = new RequestContextBuilder().withIp(mocks.ip).withUa(mocks.ua).build();

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await strategy.evaluate(context)).toEqual({
        kind: "deny",
        reason: "security.countermeasure.ban.strategy.executed",
        response: { status: 403 },
      });
      expect(loggerInfo).toHaveBeenCalled();
      expect(EventStore.saved).toEqual([mocks.GenericSecurityViolationDetectedBanDenyEvent]);
    });
  });

  test("mirage", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const mirage = new SecurityCountermeasureMirageStrategy(deps);
    const strategy = new ShieldSecurityStrategy([new SecurityPolicy(fail, mirage)]);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await strategy.evaluate(context)).toEqual({ kind: "mirage", response: { status: 200 } });
      expect(loggerInfo).toHaveBeenCalled();
    });
  });

  test("delay - allow", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, { duration, after: { kind: "allow" } });
    const strategy = new ShieldSecurityStrategy([new SecurityPolicy(fail, tarpit)]);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await strategy.evaluate(context)).toEqual({ kind: "delay", duration, after: { kind: "allow" } });
      expect(loggerInfo).toHaveBeenCalled();
    });
  });

  test("delay - deny", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
      duration,
      after: { kind: "deny", reason: "rejected", response: { status: 403 } },
    });
    const strategy = new ShieldSecurityStrategy([new SecurityPolicy(fail, tarpit)]);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await strategy.evaluate(context)).toEqual({
        kind: "delay",
        duration,
        after: { kind: "deny", reason: "rejected", response: { status: 403 } },
      });
      expect(loggerInfo).toHaveBeenCalled();
    });
  });

  test("delay - mirage", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
      duration,
      after: { kind: "mirage", response: { status: 200 } },
    });
    const strategy = new ShieldSecurityStrategy([new SecurityPolicy(fail, tarpit)]);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await strategy.evaluate(context)).toEqual({
        kind: "delay",
        duration,
        after: { kind: "mirage", response: { status: 200 } },
      });
      expect(loggerInfo).toHaveBeenCalled();
    });
  });

  test("delay - delay", async () => {
    using loggerInfo = spyOn(Logger, "info");
    const tarpit = new SecurityCountermeasureTarpitStrategy(deps, {
      duration,
      after: { kind: "delay", duration, after: { kind: "allow" } },
    });
    const strategy = new ShieldSecurityStrategy([new SecurityPolicy(fail, tarpit)]);

    await CorrelationStorage.run(mocks.correlationId, async () => {
      expect(await strategy.evaluate(context)).toEqual({
        kind: "delay",
        duration,
        after: { kind: "delay", duration, after: { kind: "allow" } },
      });
      expect(loggerInfo).toHaveBeenCalled();
    });
  });

  test("missing policies", () => {
    expect(() => new ShieldSecurityStrategy([])).toThrow("shield.security.strategy.error.missing.policies");
  });

  test("just enough policies", () => {
    expect(() => new ShieldSecurityStrategy(tools.repeat(new SecurityPolicy(pass, noop), 5))).not.toThrow();
  });

  test("max policies", () => {
    expect(() => new ShieldSecurityStrategy(tools.repeat(new SecurityPolicy(pass, noop), 6))).toThrow(
      "shield.security.strategy.error.max.policies",
    );
  });
});
