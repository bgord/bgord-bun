import { describe, expect, spyOn, test } from "bun:test";
import dns from "dns/promises";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { PrerequisiteVerifierDnsAdapter } from "../src/prerequisite-verifier-dns.adapter";
import { PrerequisiteVerifierWithLoggerAdapter } from "../src/prerequisite-verifier-with-logger.adapter";
import * as mocks from "./mocks";

const hostname = "api.example.com";
const result = { address: hostname, family: 4 };
const inner = new PrerequisiteVerifierDnsAdapter({ hostname });

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const Logger = new LoggerNoopAdapter();
const deps = { Clock, Logger };

const prerequisite = new PrerequisiteVerifierWithLoggerAdapter({ inner }, deps);

describe("PrerequisiteVerifierWithLoggerAdapter", () => {
  test("success", async () => {
    const loggerInfo = spyOn(Logger, "info");
    spyOn(dns, "lookup").mockResolvedValue(result);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Success - ${inner.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
  });

  test("failure", async () => {
    const loggerError = spyOn(Logger, "error");
    spyOn(dns, "lookup").mockRejectedValue(mocks.IntentionalError);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(loggerError).toHaveBeenCalledWith({
      component: "infra",
      message: `Failure - ${inner.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
      error: mocks.IntentionalError,
    });
  });

  test("undetermined", async () => {
    const loggerInfo = spyOn(Logger, "info");
    spyOn(inner, "verify").mockResolvedValue(mocks.VerificationUndetermined);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Undetermined - ${inner.kind}`,
      operation: "prerequisite_verify",
      durationMs: expect.any(Number),
    });
  });

  test("preserves kind", () => {
    expect(prerequisite.kind).toEqual(inner.kind);
  });
});
