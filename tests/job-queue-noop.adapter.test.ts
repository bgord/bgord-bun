import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobQueueAdapterNoop } from "../src/job-queue-noop.adapter";
import { JobRegistryAdapter } from "../src/job-registry.adapter";
import { JobRetryPolicyLimitStrategy } from "../src/job-retry-policy-limit.strategy";
import { SEND_EMAIL_JOB, SendEmailJobSchema, type SendEmailJobType } from "../src/modules/system/jobs";
import * as mocks from "./mocks";

const retry = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3));
const handler = async (_job: SendEmailJobType) => {};
const registry = new JobRegistryAdapter<SendEmailJobType>({
  [SEND_EMAIL_JOB]: { schema: SendEmailJobSchema, retry, handler },
});
const deps = { registry };

const queue = new JobQueueAdapterNoop<SendEmailJobType>(deps);

describe("JobQueueAdapter", () => {
  test("enqueue", async () => {
    expect(await queue.enqueue(mocks.GenericSendEmailJob)).toEqual(mocks.GenericSendEmailJob);
  });

  test("complete", async () => {
    expect(async () => queue.complete(mocks.GenericSendEmailJob.id)).not.toThrow();
  });

  test("fail", async () => {
    expect(async () => queue.fail(mocks.GenericSendEmailJob.id)).not.toThrow();
  });

  test("requeue", async () => {
    expect(async () =>
      queue.requeue(mocks.GenericSendEmailJob.id, 1, tools.Duration.Seconds(5)),
    ).not.toThrow();
  });

  test("getRetryPolicy", async () => {
    expect(queue.getRetryPolicy(mocks.GenericSendEmailJob.name)).toEqual(retry);
  });

  test("getRetryPolicy - missing", async () => {
    expect(() => queue.getRetryPolicy("unknown")).toThrow("job.registry.adapter.error.unknown.job");
  });

  test("getHandler", async () => {
    expect(queue.getHandler(mocks.GenericSendEmailJob.name)).toEqual(handler);
  });

  test("getHandler - missing", async () => {
    expect(() => queue.getRetryPolicy("unknown")).toThrow("job.registry.adapter.error.unknown.job");
  });
});
