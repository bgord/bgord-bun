import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { CronExpressionSchedules } from "../src/cron-expression.vo";
import { JobClaimerNoopAdapter } from "../src/job-claimer-noop.adapter";
import { JobCompleterCollectingAdapter } from "../src/job-completer-collecting.adapter";
import { JobCompleterNoopAdapter } from "../src/job-completer-noop.adapter";
import { JobEnqueuerNoopAdapter } from "../src/job-enqueuer-noop.adapter";
import { JobFailerCollectingAdapter } from "../src/job-failer-collecting.adapter";
import { JobFailerNoopAdapter } from "../src/job-failer-noop.adapter";
import { JobQueueAdapter } from "../src/job-queue.adapter";
import { JobRegistryAdapter } from "../src/job-registry.adapter";
import { JobRequeuerCollectingAdapter } from "../src/job-requeuer-collecting.adapter";
import { JobRequeuerNoopAdapter } from "../src/job-requeuer-noop.adapter";
import { JobRetryPolicyBackoffStrategy } from "../src/job-retry-policy-backoff.strategy";
import { JobRetryPolicyCompositeStrategy } from "../src/job-retry-policy-composite.strategy";
import { JobRetryPolicyLimitStrategy } from "../src/job-retry-policy-limit.strategy";
import { JobWorker } from "../src/job-worker.service";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import { RetryBackoffLinearStrategy } from "../src/retry-backoff-linear.strategy";
import * as mocks from "./mocks";

const base = tools.Duration.Seconds(1);
const retry = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(0));

const registry = new JobRegistryAdapter<mocks.SendEmailJobType>({
  [mocks.SEND_EMAIL_JOB]: { schema: mocks.SendEmailJobSchema, retry, handler: async () => {} },
});

const serializer = new PayloadSerializerJsonAdapter();
const enqueuer = new JobEnqueuerNoopAdapter();
const claimer = new JobClaimerNoopAdapter();
const completer = new JobCompleterNoopAdapter();
const failer = new JobFailerNoopAdapter();
const requeuer = new JobRequeuerNoopAdapter();

const deps = { registry, enqueuer, claimer, completer, failer, requeuer, serializer };
const queue = new JobQueueAdapter<mocks.SendEmailJobType>(deps);

const limit = tools.Int.positive(10);
const config = { label: "SendEmailWorker", cron: CronExpressionSchedules.EVERY_MINUTE, limit };

const worker = JobWorker(config, { queue });

const serialized = {
  ...mocks.GenericSendEmailJob,
  payload: serializer.serialize(mocks.GenericSendEmailJob.payload),
};

describe("JobWorker", () => {
  test("config", () => {
    expect(worker.label).toEqual(config.label);
    expect(worker.cron).toEqual(config.cron);
  });

  test("no jobs", async () => {
    const completer = new JobCompleterCollectingAdapter();
    const failer = new JobFailerCollectingAdapter();
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, completer, failer });
    const worker = JobWorker(config, { queue });

    await CorrelationStorage.run(mocks.correlationId, worker.handler);

    expect(completer.completed).toEqual([]);
    expect(failer.failed).toEqual([]);
  });

  test("complete", async () => {
    const completer = new JobCompleterCollectingAdapter();
    const claimer = new JobClaimerNoopAdapter([serialized]);
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, claimer, completer });
    const worker = JobWorker(config, { queue });

    await CorrelationStorage.run(mocks.correlationId, worker.handler);

    expect(completer.completed).toEqual([mocks.GenericSendEmailJob.id]);
  });

  test("fail - no retry", async () => {
    const failer = new JobFailerCollectingAdapter();
    const claimer = new JobClaimerNoopAdapter([serialized]);
    const registry = new JobRegistryAdapter<mocks.SendEmailJobType>({
      [mocks.SEND_EMAIL_JOB]: {
        schema: mocks.SendEmailJobSchema,
        retry: new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(0)),
        handler: mocks.throwIntentionalErrorAsync,
      },
    });
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, claimer, registry, failer });
    const worker = JobWorker(config, { queue });

    await CorrelationStorage.run(mocks.correlationId, worker.handler);

    expect(failer.failed).toEqual([mocks.GenericSendEmailJob.id]);
  });

  test("fail - requeue", async () => {
    const retry = new JobRetryPolicyCompositeStrategy([
      new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3)),
      new JobRetryPolicyBackoffStrategy(new RetryBackoffLinearStrategy(base)),
    ]);
    const registry = new JobRegistryAdapter<mocks.SendEmailJobType>({
      [mocks.SEND_EMAIL_JOB]: {
        schema: mocks.SendEmailJobSchema,
        retry,
        handler: mocks.throwIntentionalErrorAsync,
      },
    });
    const requeuer = new JobRequeuerCollectingAdapter();
    const claimer = new JobClaimerNoopAdapter([serialized]);
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, claimer, registry, requeuer });
    const worker = JobWorker(config, { queue });

    await CorrelationStorage.run(mocks.correlationId, worker.handler);

    expect(requeuer.requeued).toEqual([{ id: mocks.GenericSendEmailJob.id, revision: 1, delay: base }]);
  });

  test("fail - out of retries", async () => {
    const failer = new JobFailerCollectingAdapter();
    const claimer = new JobClaimerNoopAdapter([{ ...serialized, revision: 3 }]);
    const registry = new JobRegistryAdapter<mocks.SendEmailJobType>({
      [mocks.SEND_EMAIL_JOB]: {
        schema: mocks.SendEmailJobSchema,
        retry,
        handler: mocks.throwIntentionalErrorAsync,
      },
    });
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, registry, claimer, failer });
    const worker = JobWorker(config, { queue });

    await CorrelationStorage.run(mocks.correlationId, worker.handler);

    expect(failer.failed).toEqual([mocks.GenericSendEmailJob.id]);
  });

  test("multiple jobs", async () => {
    const completer = new JobCompleterCollectingAdapter();
    const claimer = new JobClaimerNoopAdapter([
      { ...serialized, id: mocks.userId },
      { ...serialized, id: mocks.anotherUserId },
    ]);
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, claimer, completer });
    const worker = JobWorker(config, { queue });

    await CorrelationStorage.run(mocks.correlationId, worker.handler);

    expect(completer.completed).toEqual([mocks.userId, mocks.anotherUserId]);
  });
});
