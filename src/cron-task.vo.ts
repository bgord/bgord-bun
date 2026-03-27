import type { CronExpressionType } from "./cron-expression.vo";

export type CronTask = { label: string; cron: CronExpressionType; handler: () => Promise<void> };
