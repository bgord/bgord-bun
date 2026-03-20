import { describe, expect, test } from "bun:test";
import { AlertChannelCollectingAdapter } from "../src/alert-channel-collecting.adapter";
import * as mocks from "./mocks";

const adapter = new AlertChannelCollectingAdapter();

describe("AlertChannelCollectingAdapter", () => {
  test("send", async () => {
    const adapter = new AlertChannelCollectingAdapter();

    await adapter.send(mocks.alert);
    await adapter.send(mocks.alertWithError);

    expect(adapter.alerts).toEqual([mocks.alert, mocks.alertWithError]);
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
