import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
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
const registry = new JobRegistryAdapter<mocks.SendEmailJobType>({
  [mocks.SEND_EMAIL_JOB]: { schema: mocks.SendEmailJobSchema, retry },
});

const deps = { enqueuer, claimer, completer, failer, registry, requeuer, serializer };

const serialized = {
  ...mocks.GenericSendEmailJob,
  payload: serializer.serialize(mocks.GenericSendEmailJob.payload),
};

const base = { component: "infra", operation: "job_queue" };

const revision = mocks.GenericSendEmailJob.revision + 1;
const delay = tools.Duration.MIN;

const inner = new JobQueueAdapter<mocks.SendEmailJobType>(deps);

describe("JobQueueWithLoggerAdapter", () => {
  test("enqueue", async () => {
    using enqueue = spyOn(inner, "enqueue");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await queue.enqueue(mocks.GenericSendEmailJob);

    expect(Logger.entries).toEqual([
      { message: "GENERIC_SEND_EMAIL_JOB enqueued", metadata: mocks.GenericSendEmailJob, ...base },
    ]);
    expect(enqueue).toHaveBeenCalledWith(mocks.GenericSendEmailJob);
  });

  test("claim - no jobs", async () => {
    using claim = spyOn(inner, "claim");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await queue.claim(limit);

    expect(Logger.entries).toEqual([
      { message: "Claimed 0 job(s)", metadata: { count: 0, limit: undefined, jobs: [] }, ...base },
    ]);
    expect(claim).toHaveBeenCalledWith(undefined);
  });

  test("claim - with jobs", async () => {
    const claimer = new JobClaimerNoopAdapter([serialized]);
    const inner = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, claimer });
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await queue.claim(limit);

    expect(Logger.entries).toEqual([
      {
        message: "Claimed 1 job(s)",
        metadata: { count: 1, limit: undefined, jobs: [mocks.GenericSendEmailJob] },
        ...base,
      },
    ]);
  });

  test("complete", async () => {
    using complete = spyOn(inner, "complete");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await queue.complete(mocks.GenericSendEmailJob.id);

    expect(Logger.entries).toEqual([
      { message: "Job completed", metadata: { id: mocks.GenericSendEmailJob.id }, ...base },
    ]);
    expect(complete).toHaveBeenCalledWith(mocks.GenericSendEmailJob.id);
  });

  test("fail", async () => {
    using fail = spyOn(inner, "fail");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await queue.fail(mocks.GenericSendEmailJob.id);

    expect(Logger.entries).toEqual([
      { message: "Job failed", metadata: { id: mocks.GenericSendEmailJob.id }, ...base },
    ]);
    expect(fail).toHaveBeenCalledWith(mocks.GenericSendEmailJob.id);
  });

  test("requeue", async () => {
    using requeue = spyOn(inner, "requeue");
    const Logger = new LoggerCollectingAdapter();
    const queue = new JobQueueWithLoggerAdapter<mocks.SendEmailJobType>({ inner, Logger });

    await queue.requeue(mocks.GenericSendEmailJob.id, revision, delay);

    expect(Logger.entries).toEqual([
      {
        message: "Job requeued",
        metadata: { id: mocks.GenericSendEmailJob.id, revision, delay },
        ...base,
      },
    ]);
    expect(requeue).toHaveBeenCalledWith(mocks.GenericSendEmailJob.id, revision, delay);
  });
});
