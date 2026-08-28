import { describe, expect, test } from "bun:test";
import { AlertChannelCollectingAdapter } from "../src/alert-channel-collecting.adapter";
import * as testcase from "./testcases";

const cases = testcase.alertChannel();

describe("AlertChannelCollectingAdapter", () => {
  test(cases.send.name, async () => {
    const adapter = new AlertChannelCollectingAdapter();

    await adapter.send(cases.send.input);
    await adapter.send(cases.subjects.alertWithError);

    expect(adapter.alerts).toEqual([...cases.send.output, cases.subjects.alertWithError]);
  });

  test(cases.verify.name, async () => {
    const adapter = new AlertChannelCollectingAdapter();

    expect(await adapter.verify()).toEqual(cases.verify.output);
  });
});
