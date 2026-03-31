import * as tools from "@bgord/tools";
import type { CronTask } from "./cron-task.vo";
import type { GenericJob } from "./job.types";
import type { JobQueuePort } from "./job-queue.port";

type Config = { label: CronTask["label"]; cron: CronTask["cron"]; limit: tools.IntegerPositiveType };

type Dependencies<Job extends GenericJob> = { queue: JobQueuePort<Job> };

export function JobWorker<Job extends GenericJob>(config: Config, deps: Dependencies<Job>): CronTask {
  return {
    label: config.label,
    cron: config.cron,
    handler: async () => {
      const jobs = await deps.queue.claim(config.limit);

      for (const job of jobs) {
        try {
          const handler = deps.queue.getHandler(job.name);

          await handler(job);
          await deps.queue.complete(job.id);
        } catch (error) {
          const policy = deps.queue.getRetryPolicy(job.name);

          const retry = policy.evaluate(job, tools.ErrorNormalizer.normalize(error));

          if (!retry) {
            await deps.queue.fail(job.id);
            continue;
          }

          await deps.queue.requeue(job.id, job.revision + 1, retry);
        }
      }
    },
  };
}
