import * as tools from "@bgord/tools";
import { CorrelationStorage } from "./correlation-storage.service";
import type { CronTask } from "./cron-task.vo";
import type { GenericJob } from "./job.types";
import type { JobQueuePort } from "./job-queue.port";

type Config = { label: CronTask["label"]; cron: CronTask["cron"]; limit: tools.IntegerPositiveType };

type Dependencies<Job extends GenericJob> = { JobQueue: JobQueuePort<Job> };

export function JobWorker<Job extends GenericJob>(config: Config, deps: Dependencies<Job>): CronTask {
  return {
    label: config.label,
    cron: config.cron,
    handler: async () => {
      const jobs = await deps.JobQueue.claim(config.limit);

      for (const job of jobs) {
        await CorrelationStorage.run(job.correlationId, async () => {
          try {
            const handler = deps.JobQueue.getHandler(job.name);

            await handler(job);
            await deps.JobQueue.complete(job.id);
          } catch (error) {
            const policy = deps.JobQueue.getRetryPolicy(job.name);

            const retry = policy.evaluate(job, tools.ErrorNormalizer.normalize(error));

            if (!retry) return deps.JobQueue.fail(job.id);
            await deps.JobQueue.requeue(job.id, job.revision + 1, retry);
          }
        });
      }
    },
  };
}
