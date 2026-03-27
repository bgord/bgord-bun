import * as v from "valibot";

export const CronExpressionError = { Type: "cron.expression.type", Invalid: "cron.expression.invalid" };

export const CronExpression = v.pipe(
  v.string(CronExpressionError.Type),
  v.check((value) => {
    try {
      return Bun.cron.parse(value) !== null;
    } catch {
      return false;
    }
  }, CronExpressionError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("CronExpression"),
);

export type CronExpressionType = v.InferOutput<typeof CronExpression>;

export const CronExpressionSchedules = {
  EVERY_MINUTE: v.parse(CronExpression, "* * * * *"),
  EVERY_HOUR: v.parse(CronExpression, "0 * * * *"),
} as const;
