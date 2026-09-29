import { describe, expect, test } from "bun:test";
import { EnvironmentLoaderProcessSafeAdapter } from "../src/environment-loader-process-safe.adapter";
import * as testcase from "./testcases";

const cases = testcase.environmentLoader();

describe("EnvironmentLoaderProcessSafe", () => {
  test(cases.happyPath.name, async () => {
    process.env["APP_NAME"] = cases.happyPath.input.APP_NAME;
    const env = { ...process.env, ...cases.happyPath.input };
    const adapter = new EnvironmentLoaderProcessSafeAdapter(env, cases.subjects.config);

    const result = await adapter.load();

    expect(result).toEqual(cases.happyPath.output);
    expect(Object.isFrozen(result)).toEqual(true);
    expect(env["APP_NAME"]).toBeUndefined();
    expect(process.env["APP_NAME"]).toBeUndefined();
  });

  test(cases.failure.name, async () => {
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      // @ts-expect-error Changed schema assertion
      { ...process.env, ...cases.failure.input },
      cases.subjects.config,
    );

    expect(async () => adapter.load()).toThrow(cases.failure.output);
  });

  test(cases.failureAsyncSchema.name, async () => {
    const adapter = new EnvironmentLoaderProcessSafeAdapter(
      { ...process.env, ...cases.failureAsyncSchema.input },
      cases.subjects.asyncConfig,
    );

    expect(async () => adapter.load()).toThrow(cases.failureAsyncSchema.output);
  });
});
