import type * as tools from "@bgord/tools";
import type { CronTask } from "./cron-task.vo";
import type { JobPrunerPort } from "./job-pruner.port";

type Config = { label: CronTask["label"]; cron: CronTask["cron"]; olderThan: tools.Duration };
type Dependencies = { JobPruner: JobPrunerPort };

export function JobPrunerWorker(config: Config, deps: Dependencies): CronTask {
  return {
    label: config.label,
    cron: config.cron,
    handler: async () => {
      await deps.JobPruner.prune(config.olderThan);
    },
  };
}
