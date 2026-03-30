import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobRegistryAdapter } from "../src/job-registry.adapter";
import { JobRetryPolicyLimitStrategy } from "../src/job-retry-policy-limit.strategy";
import * as mocks from "./mocks";

const retry = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3));

const registry = new JobRegistryAdapter<mocks.SendEmailJobType>({
  [mocks.SEND_EMAIL_JOB]: { schema: mocks.SendEmailJobSchema, retry },
});

describe("JobRegistryAdapter", () => {
  test("names", () => {
    expect(registry.names).toEqual([mocks.SEND_EMAIL_JOB]);
  });

  test("accepts - true", () => {
    expect(registry.accepts(mocks.SEND_EMAIL_JOB)).toEqual(true);
  });

  test("accepts - false", () => {
    expect(registry.accepts("UNKNOWN_JOB")).toEqual(false);
  });

  test("validate", () => {
    expect(registry.validate(mocks.GenericSendEmailJob)).toEqual(mocks.GenericSendEmailJob);
  });

  test("validate - missing name", () => {
    expect(() => registry.validate({})).toThrow("job.registry.adapter.error.missing.name");
  });

  test("validate - unknown name", () => {
    expect(() => registry.validate({ name: "UNKNOWN_JOB" })).toThrow(
      "job.registry.adapter.error.unknown.job",
    );
  });

  test("validate - invalid shape", () => {
    expect(() => registry.validate({ ...mocks.GenericSendEmailJob, payload: { to: 123 } })).toThrow();
  });

  test("validate - async schema", () => {
    const asyncSchema = {
      "~standard": {
        version: 1 as const,
        vendor: "test",
        validate: () => Promise.resolve({ value: mocks.GenericSendEmailJob }),
      },
    };

    const registry = new JobRegistryAdapter<mocks.SendEmailJobType>({
      [mocks.SEND_EMAIL_JOB]: { schema: asyncSchema, retry },
    });

    expect(() => registry.validate(mocks.GenericSendEmailJob)).toThrow("job.registry.no.async.schema");
  });

  test("getRetryPolicy", () => {
    expect(registry.getRetryPolicy(mocks.SEND_EMAIL_JOB)).toEqual(retry);
  });

  test("getRetryPolicy - unknown job", () => {
    expect(() => registry.getRetryPolicy("UNKNOWN_JOB")).toThrow("job.registry.adapter.error.unknown.job");
  });
});
