import { describe, expect, test } from "bun:test";
import { EnvironmentLoaderProcessAdapter } from "../src/environment-loader-process.adapter";
import * as testcase from "./testcases";

const cases = testcase.environmentLoader();

describe("EnvironmentLoaderProcess", () => {
  test(cases.happyPath.name, async () => {
    const adapter = new EnvironmentLoaderProcessAdapter(
      { ...process.env, ...cases.happyPath.input },
      cases.subjects.config,
    );

    const result = await adapter.load();

    expect(result).toEqual(cases.happyPath.output);
    expect(Object.isFrozen(result)).toEqual(true);

    const second = await adapter.load();

    expect(second).toEqual(cases.happyPath.output);
    expect(Object.isFrozen(second)).toEqual(true);
  });

  test(cases.failure.name, () => {
    const adapter = new EnvironmentLoaderProcessAdapter(
      // @ts-expect-error Changed schema assertion
      { ...process.env, ...cases.failure.input },
      cases.subjects.config,
    );

    expect(async () => adapter.load()).toThrow(cases.failure.output);
  });

  test(cases.failureAsyncSchema.name, async () => {
    const adapter = new EnvironmentLoaderProcessAdapter(
      { ...process.env, ...cases.failureAsyncSchema.input },
      cases.subjects.asyncConfig,
    );

    expect(async () => adapter.load()).toThrow(cases.failureAsyncSchema.output);
  });
});
