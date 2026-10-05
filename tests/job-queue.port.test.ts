import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { JobDispatcherPort, JobQueuePort } from "../src/job-queue.port";
import { JobQueueAdapterNoop } from "../src/job-queue-noop.adapter";
import { JobRegistryAdapter } from "../src/job-registry.adapter";
import { JobRetryPolicyLimitStrategy } from "../src/job-retry-policy-limit.strategy";
import { SEND_EMAIL_JOB, SendEmailJobSchema, type SendEmailJobType } from "../src/modules/system/jobs";
import type * as mocks from "./mocks";

const retry = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3));
const handler = async (_job: SendEmailJobType) => {};
const registry = new JobRegistryAdapter<SendEmailJobType>({
  [SEND_EMAIL_JOB]: { schema: SendEmailJobSchema, retry, handler },
});

describe("JobDispatcherPort", () => {
  test("variance - narrower job union", () => {
    const JobDispatcher: JobDispatcherPort<SendEmailJobType | mocks.SendSmsJobType> = {
      enqueue: async (job) => job,
    };

    const narrowed: JobDispatcherPort<SendEmailJobType> = JobDispatcher;

    expect<unknown>(narrowed).toBe(JobDispatcher);
  });

  test("variance - job outside union", () => {
    const JobDispatcher: JobDispatcherPort<SendEmailJobType> = { enqueue: async (job) => job };

    // @ts-expect-error SendSmsJobType is not in the dispatcher's union
    const widened: JobDispatcherPort<SendEmailJobType | mocks.SendSmsJobType> = JobDispatcher;

    expect<unknown>(widened).toBe(JobDispatcher);
  });

  test("variance - JobQueuePort - job outside union - unchecked", () => {
    const JobQueue: JobQueuePort<SendEmailJobType> = new JobQueueAdapterNoop<SendEmailJobType>({ registry });

    const widened: JobDispatcherPort<SendEmailJobType | mocks.SendSmsJobType> = JobQueue;

    expect<unknown>(widened).toBe(JobQueue);
  });
});
