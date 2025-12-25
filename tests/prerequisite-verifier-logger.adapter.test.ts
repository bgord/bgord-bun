import { describe, expect, spyOn, test } from "bun:test";
import dns from "dns/promises";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { PrerequisiteVerifierDnsAdapter } from "../src/prerequisite-verifier-dns.adapter";
import { PrerequisiteVerifierLoggerAdapter } from "../src/prerequisite-verifier-logger.adapter";
import * as mocks from "./mocks";

const hostname = "api.example.com";
const result = { address: hostname, family: 4 };
const inner = new PrerequisiteVerifierDnsAdapter({ hostname });

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

const prerequisite = new PrerequisiteVerifierLoggerAdapter({ inner }, deps);

describe("PrerequisiteVerifierTimeoutAdapter", () => {
  test("success", async () => {
    const loggerInfo = spyOn(Logger, "info");
    spyOn(dns, "lookup").mockResolvedValue(result);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      message: `Success - ${inner.kind}`,
      operation: "prerequisite_verify",
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
    });
  });

  test("preserves kind", () => {
    expect(prerequisite.kind).toEqual(inner.kind);
  });
});
