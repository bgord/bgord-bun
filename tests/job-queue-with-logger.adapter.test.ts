import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { JobQueueAdapterNoop } from "../src/job-queue-noop.adapter";
import { JobQueueWithLoggerAdapter } from "../src/job-queue-with-logger.adapter";
import { JobRegistryAdapter } from "../src/job-registry.adapter";
import { JobRetryPolicyLimitStrategy } from "../src/job-retry-policy-limit.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const limit = tools.Int.positive(5);
const retry = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3));
const handler = async (_job: mocks.SendEmailJobType) => {};
const registry = new JobRegistryAdapter<mocks.SendEmailJobType>({
  [mocks.SEND_EMAIL_JOB]: { schema: mocks.SendEmailJobSchema, retry, handler },
});

const deps = { registry };

const base = { component: "infra", operation: "job_queue" };

const revision = mocks.GenericSendEmailJob.revision + 1;

const inner = new JobQueueAdapterNoop<mocks.SendEmailJobType>(deps);

describe("JobQueueWithLoggerAdapter", () => {
  test("enqueue", async () => {
    using enqueue = spyOn(inner, "enqueue");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () =>
      queue.enqueue(mocks.GenericSendEmailJob),
    );

    expect(Logger.entries).toEqual([
      {
        message: "GENERIC_SEND_EMAIL_JOB enqueued",
        metadata: mocks.GenericSendEmailJob,
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(enqueue).toHaveBeenCalledWith(mocks.GenericSendEmailJob);
  });

  test("claim - no jobs", async () => {
    using claim = spyOn(inner, "claim");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () => queue.claim(limit));

    expect(Logger.entries).toEqual([
      {
        message: "Claimed 0 job(s)",
        metadata: { count: 0, limit: 5, jobs: [] },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(claim).toHaveBeenCalledWith(5);
  });

  test("complete", async () => {
    using complete = spyOn(inner, "complete");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () =>
      queue.complete(mocks.GenericSendEmailJob.id),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Job completed",
        metadata: { id: mocks.GenericSendEmailJob.id },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(complete).toHaveBeenCalledWith(mocks.GenericSendEmailJob.id);
  });

  test("fail", async () => {
    using fail = spyOn(inner, "fail");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () =>
      queue.fail(mocks.GenericSendEmailJob.id),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Job failed",
        metadata: { id: mocks.GenericSendEmailJob.id },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(fail).toHaveBeenCalledWith(mocks.GenericSendEmailJob.id);
  });

  test("requeue", async () => {
    using requeue = spyOn(inner, "requeue");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () =>
      queue.requeue(mocks.GenericSendEmailJob.id, revision, tools.Duration.ZERO),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Job requeued",
        metadata: { id: mocks.GenericSendEmailJob.id, revision, delay: tools.Duration.ZERO },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(requeue).toHaveBeenCalledWith(mocks.GenericSendEmailJob.id, revision, tools.Duration.ZERO);
  });

  test("getRetryPolicy", async () => {
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    expect(queue.getRetryPolicy(mocks.GenericSendEmailJob.name)).toEqual(retry);
  });

  test("getRetryPolicy - missing", async () => {
    const Logger = new LoggerCollectingAdapter();

    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });
    expect(() => queue.getRetryPolicy("unknown")).toThrow("job.registry.adapter.error.unknown.job");
  });

  test("getHandler", async () => {
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    expect(queue.getHandler(mocks.GenericSendEmailJob.name)).toEqual(handler);
  });

  test("getHandler - missing", async () => {
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    expect(() => queue.getRetryPolicy("unknown")).toThrow("job.registry.adapter.error.unknown.job");
  });
});
