import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
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
import { JobRetryPolicyLimitStrategy } from "../src/job-retry-policy-limit.strategy";
import { PayloadSerializerJsonAdapter } from "../src/payload-serializer-json.adapter";
import * as mocks from "./mocks";

const retry = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3));
const registry = new JobRegistryAdapter<mocks.SendEmailJobType>({
  [mocks.SEND_EMAIL_JOB]: { schema: mocks.SendEmailJobSchema, retry },
});
const serializer = new PayloadSerializerJsonAdapter();
const enqueuer = new JobEnqueuerNoopAdapter();
const claimer = new JobClaimerNoopAdapter();
const completer = new JobCompleterNoopAdapter();
const requeuer = new JobRequeuerNoopAdapter();
const failer = new JobFailerNoopAdapter();

const deps = { registry, enqueuer, claimer, completer, failer, requeuer, serializer };

const serialized = {
  ...mocks.GenericSendEmailJob,
  payload: serializer.serialize(mocks.GenericSendEmailJob.payload),
};

const queue = new JobQueueAdapter<mocks.SendEmailJobType>(deps);

describe("JobQueueAdapter", () => {
  test("enqueue", async () => {
    expect(await queue.enqueue(mocks.GenericSendEmailJob)).toEqual(mocks.GenericSendEmailJob);
  });

  test("claim - no jobs", async () => {
    expect(await queue.claim()).toEqual([]);
  });

  test("claim - with jobs", async () => {
    const claimer = new JobClaimerNoopAdapter([serialized]);
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, claimer });

    expect(await queue.claim()).toEqual([mocks.GenericSendEmailJob]);
  });

  test("complete", async () => {
    const completer = new JobCompleterCollectingAdapter();
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, completer });

    await queue.complete(mocks.GenericSendEmailJob.id);

    expect(completer.completed).toEqual([mocks.GenericSendEmailJob.id]);
  });

  test("fail", async () => {
    const failer = new JobFailerCollectingAdapter();
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, failer });

    await queue.fail(mocks.GenericSendEmailJob.id);

    expect(failer.failed).toEqual([mocks.GenericSendEmailJob.id]);
  });

  test("requeue", async () => {
    const requeuer = new JobRequeuerCollectingAdapter();
    const queue = new JobQueueAdapter<mocks.SendEmailJobType>({ ...deps, requeuer });
    const delay = tools.Duration.Seconds(5);

    await queue.requeue(mocks.GenericSendEmailJob.id, 1, delay);

    expect(requeuer.requeued).toEqual([{ id: mocks.GenericSendEmailJob.id, revision: 1, delay }]);
  });
});
