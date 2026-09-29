import { describe, expect, spyOn, test } from "bun:test";
import { EnvironmentLoaderProcessAdapter } from "../src/environment-loader-process.adapter";
import { EnvironmentLoaderWithMemoAdapter } from "../src/environment-loader-with-memo.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const cases = testcase.environmentLoader();

describe("EnvironmentLoaderWithMemoAdapter", () => {
  test(cases.happyPath.name, async () => {
    const inner = new EnvironmentLoaderProcessAdapter(
      { ...process.env, ...cases.happyPath.input },
      cases.subjects.config,
    );
    using innerLoad = spyOn(inner, "load");
    const adapter = new EnvironmentLoaderWithMemoAdapter({ inner });

    const result = await adapter.load();

    expect(result).toEqual(cases.happyPath.output);
    expect(result).toBe(await adapter.load());
    expect(innerLoad).toHaveBeenCalledTimes(1);
  });

  test(cases.happyPathSeparateInstances.name, async () => {
    const first = new EnvironmentLoaderWithMemoAdapter({
      inner: new EnvironmentLoaderProcessAdapter(
        { ...process.env, ...cases.happyPath.input },
        cases.subjects.config,
      ),
    });
    const second = new EnvironmentLoaderWithMemoAdapter({
      inner: new EnvironmentLoaderProcessAdapter(
        { ...process.env, ...cases.happyPathSeparateInstances.input },
        cases.subjects.config,
      ),
    });

    const resultFirst = await first.load();
    const resultSecond = await second.load();

    expect(resultFirst).toEqual(cases.happyPath.output);
    expect(resultSecond).toEqual(cases.happyPathSeparateInstances.output);
  });

  test("rejection", async () => {
    const inner = new EnvironmentLoaderProcessAdapter(
      { ...process.env, ...cases.happyPath.input },
      cases.subjects.config,
    );
    using innerLoad = spyOn(inner, "load").mockRejectedValueOnce(new Error(mocks.IntentionalError));
    const adapter = new EnvironmentLoaderWithMemoAdapter({ inner });

    expect(async () => adapter.load()).toThrow(mocks.IntentionalError);

    const result = await adapter.load();

    expect(result).toEqual(cases.happyPath.output);
    expect(result).toBe(await adapter.load());
    expect(innerLoad).toHaveBeenCalledTimes(2);
  });
});
