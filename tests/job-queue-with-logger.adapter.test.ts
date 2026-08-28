import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { JobQueueAdapterNoop } from "../src/job-queue-noop.adapter";
import { JobQueueWithLoggerAdapter } from "../src/job-queue-with-logger.adapter";
import { JobRegistryAdapter } from "../src/job-registry.adapter";
import { JobRetryPolicyLimitStrategy } from "../src/job-retry-policy-limit.strategy";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { SEND_EMAIL_JOB, SendEmailJobSchema, type SendEmailJobType } from "../src/modules/system/jobs";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const limit = tools.Int.positive(5);
const retry = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3));
const handler = async (_job: SendEmailJobType) => {};
const registry = new JobRegistryAdapter<SendEmailJobType>({
  [SEND_EMAIL_JOB]: { schema: SendEmailJobSchema, retry, handler },
});

const deps = { registry };

const base = { component: "infra", operation: "job_queue" };

const revision = v.parse(tools.RevisionValue, mocks.GenericSendEmailJob.revision + 1);

const inner = new JobQueueAdapterNoop<SendEmailJobType>(deps);

describe("JobQueueWithLoggerAdapter", () => {
  test("enqueue", async () => {
    using enqueue = spyOn(inner, "enqueue");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () =>
      queue.enqueue(mocks.GenericSendEmailJob),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Job queue enqueue attempt",
        metadata: { job: mocks.GenericSendEmailJob, delay: undefined },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
      {
        message: "Job queue enqueue success",
        metadata: {
          job: mocks.GenericSendEmailJob,
          delay: undefined,
          duration: expect.any(tools.Duration),
        },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(enqueue).toHaveBeenCalledWith(mocks.GenericSendEmailJob, undefined);
  });

  test("enqueue - delay", async () => {
    const delay = tools.Duration.Minutes(5);
    using enqueue = spyOn(inner, "enqueue");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () =>
      queue.enqueue(mocks.GenericSendEmailJob, delay),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Job queue enqueue attempt",
        metadata: { job: mocks.GenericSendEmailJob, delay },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
      {
        message: "Job queue enqueue success",
        metadata: { job: mocks.GenericSendEmailJob, delay, duration: expect.any(tools.Duration) },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(enqueue).toHaveBeenCalledWith(mocks.GenericSendEmailJob, delay);
  });

  test("enqueue - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    using _ = spyOn(inner, "enqueue").mockImplementation(mocks.throwIntentionalErrorAsync);
    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });

    expect(async () =>
      CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () =>
        queue.enqueue(mocks.GenericSendEmailJob),
      ),
    ).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        message: "Job queue enqueue attempt",
        metadata: { job: mocks.GenericSendEmailJob, delay: undefined },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
      {
        message: "Job queue enqueue error",
        error: new Error(mocks.IntentionalError),
        metadata: {
          job: mocks.GenericSendEmailJob,
          delay: undefined,
          duration: expect.any(tools.Duration),
        },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
  });

  test("claim - no jobs", async () => {
    using claim = spyOn(inner, "claim");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () => queue.claim(limit));

    expect(Logger.entries).toEqual([
      {
        message: "Job queue claim attempt",
        metadata: { limit: 5 },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
      {
        message: "Job queue claim success",
        metadata: { limit: 5, count: 0, jobs: [], duration: expect.any(tools.Duration) },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(claim).toHaveBeenCalledWith(5);
  });

  test("complete", async () => {
    using complete = spyOn(inner, "complete");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () =>
      queue.complete(mocks.GenericSendEmailJob.id),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Job queue complete attempt",
        metadata: { id: mocks.GenericSendEmailJob.id },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
      {
        message: "Job queue complete success",
        metadata: { id: mocks.GenericSendEmailJob.id, duration: expect.any(tools.Duration) },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(complete).toHaveBeenCalledWith(mocks.GenericSendEmailJob.id);
  });

  test("fail", async () => {
    using fail = spyOn(inner, "fail");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () =>
      queue.fail(mocks.GenericSendEmailJob.id),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Job queue fail attempt",
        metadata: { id: mocks.GenericSendEmailJob.id },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
      {
        message: "Job queue fail success",
        metadata: { id: mocks.GenericSendEmailJob.id, duration: expect.any(tools.Duration) },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(fail).toHaveBeenCalledWith(mocks.GenericSendEmailJob.id);
  });

  test("requeue", async () => {
    using requeue = spyOn(inner, "requeue");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });

    await CorrelationStorage.run(mocks.GenericSendEmailJob.correlationId, async () =>
      queue.requeue(mocks.GenericSendEmailJob.id, revision, tools.Duration.ZERO),
    );

    expect(Logger.entries).toEqual([
      {
        message: "Job queue requeue attempt",
        metadata: { id: mocks.GenericSendEmailJob.id, revision, delay: tools.Duration.ZERO },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
      {
        message: "Job queue requeue success",
        metadata: {
          id: mocks.GenericSendEmailJob.id,
          revision,
          delay: tools.Duration.ZERO,
          duration: expect.any(tools.Duration),
        },
        correlationId: mocks.GenericSendEmailJob.correlationId,
        ...base,
      },
    ]);
    expect(requeue).toHaveBeenCalledWith(mocks.GenericSendEmailJob.id, revision, tools.Duration.ZERO);
  });

  test("getRetryPolicy", async () => {
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });

    expect(queue.getRetryPolicy(mocks.GenericSendEmailJob.name)).toEqual(retry);
  });

  test("getRetryPolicy - missing", async () => {
    const Logger = new LoggerCollectingAdapter();

    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });
    expect(() => queue.getRetryPolicy("unknown")).toThrow("job.registry.adapter.error.unknown.job");
  });

  test("getHandler", async () => {
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });

    expect(queue.getHandler(mocks.GenericSendEmailJob.name)).toEqual(handler);
  });

  test("getHandler - missing", async () => {
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<SendEmailJobType>({ inner, Logger, Clock });

    expect(() => queue.getRetryPolicy("unknown")).toThrow("job.registry.adapter.error.unknown.job");
  });
});
