import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { JobClaimerNoopAdapter } from "../src/job-claimer-noop.adapter";
import { JobCompleterNoopAdapter } from "../src/job-completer-noop.adapter";
import { JobEnqueuerNoopAdapter } from "../src/job-enqueuer-noop.adapter";
import { JobFailerNoopAdapter } from "../src/job-failer-noop.adapter";
import { JobQueueAdapter } from "../src/job-queue.adapter";
import { JobQueueWithLoggerAdapter } from "../src/job-queue-with-logger.adapter";
import { JobRegistryAdapter } from "../src/job-registry.adapter";
import { JobRequeuerNoopAdapter } from "../src/job-requeuer-noop.adapter";
import { JobRetryPolicyLimitStrategy } from "../src/job-retry-policy-limit.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import * as mocks from "./mocks";

const enqueuer = new JobEnqueuerNoopAdapter();
const claimer = new JobClaimerNoopAdapter();
const completer = new JobCompleterNoopAdapter();
const failer = new JobFailerNoopAdapter();
const requeuer = new JobRequeuerNoopAdapter();
const serializer = new PayloadSerializerJsonAdapter();

const limit = tools.Int.positive(5);
const retry = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3));
const handler = async (_job: mocks.SendEmailJobType) => {};
const registry = new JobRegistryAdapter<mocks.SendEmailJobType>({
  [mocks.SEND_EMAIL_JOB]: { schema: mocks.SendEmailJobSchema, retry, handler },
});

const deps = { enqueuer, claimer, completer, failer, registry, requeuer, serializer };

const base = { component: "infra", operation: "job_queue" };

const revision = mocks.GenericSendEmailJob.revision + 1;
const delay = tools.Duration.MIN;

const inner = new JobQueueAdapter<mocks.SendEmailJobType>(deps);

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

  test("claim - with jobs", async () => {
    const claimer = new JobClaimerNoopAdapter([mocks.GenericSendEmailJobSerialized]);
    const inner = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, claimer });
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () => queue.claim(limit));

    expect(Logger.entries).toEqual([
      {
        message: "Claimed 1 job(s)",
        metadata: { count: 1, limit: 5, jobs: [mocks.GenericSendEmailJob] },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
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
      queue.requeue(mocks.GenericSendEmailJob.id, revision, delay),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Job requeued",
        metadata: { id: mocks.GenericSendEmailJob.id, revision, delay },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(requeue).toHaveBeenCalledWith(mocks.GenericSendEmailJob.id, revision, delay);
  });

  test("getRetryPolicy", async () => {
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>(deps);

    expect(queue.getRetryPolicy(mocks.GenericSendEmailJob.name)).toEqual(retry);
  });

  test("getRetryPolicy - missing", async () => {
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>(deps);

    expect(() => queue.getRetryPolicy("unknown")).toThrow("job.registry.adapter.error.unknown.job");
  });
});
