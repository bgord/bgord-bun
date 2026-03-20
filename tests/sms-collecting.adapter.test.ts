import { describe, expect, test } from "bun:test";
import { SmsCollectingAdapter } from "../src/sms-collecting.adapter";
import * as mocks from "./mocks";

const adapter = new SmsCollectingAdapter();

describe("SmsCollectingAdapter", () => {
  test("send", async () => {
    await adapter.send(mocks.sms);

    expect(adapter.messages).toEqual([mocks.sms]);
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
