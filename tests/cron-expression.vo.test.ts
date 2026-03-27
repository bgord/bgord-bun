import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { CronExpression, CronExpressionSchedules } from "../src/cron-expression.vo";

describe("CronExpression", () => {
  test("happy path", () => {
    expect(() => v.parse(CronExpression, "* * * * *")).not.toThrow();
    expect(() => v.parse(CronExpression, "0 9 * * MON-FRI")).not.toThrow();
  });

  test("rejects a non-string value", () => {
    expect(() => v.parse(CronExpression, 123)).toThrow("cron.expression.type");
  });

  test("rejects an empty string", () => {
    expect(() => v.parse(CronExpression, "")).toThrow("cron.expression.invalid");
  });

  test("rejects an invalid cron expression", () => {
    expect(() => v.parse(CronExpression, "not a cron")).toThrow("cron.expression.invalid");
  });

  test("schedules", () => {
    expect(CronExpressionSchedules.EVERY_MINUTE).toEqual(v.parse(CronExpression, "* * * * *"));
    expect(CronExpressionSchedules.EVERY_HOUR).toEqual(v.parse(CronExpression, "0 * * * *"));
  });
});
