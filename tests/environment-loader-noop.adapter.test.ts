import { describe, expect, test } from "bun:test";
import { EnvironmentLoaderNoopAdapter } from "../src/environment-loader-noop.adapter";
import * as testcase from "./testcases";

const cases = testcase.environmentLoader();

describe("EnvironmentLoaderNoopAdapter", () => {
  test(cases.happyPath.name, async () => {
    const adapter = new EnvironmentLoaderNoopAdapter(cases.subjects.config, cases.happyPath.input);

    const result = await adapter.load();

    expect(result).toEqual(cases.happyPath.output);
    expect(Object.isFrozen(result)).toEqual(true);

    const second = await adapter.load();

    expect(second).toEqual(cases.happyPath.output);
    expect(Object.isFrozen(second)).toEqual(true);
  });

  test(cases.failure.name, async () => {
    // @ts-expect-error Changed schema assertion
    const adapter = new EnvironmentLoaderNoopAdapter(cases.subjects.config, cases.failure.input);

    expect(async () => adapter.load()).toThrow(cases.failure.output);
  });

  test(cases.failureAsyncSchema.name, async () => {
    const adapter = new EnvironmentLoaderNoopAdapter(
      cases.subjects.asyncConfig,
      cases.failureAsyncSchema.input,
    );

    expect(async () => adapter.load()).toThrow(cases.failureAsyncSchema.output);
  });
});
