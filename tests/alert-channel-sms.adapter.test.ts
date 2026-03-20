import { describe, expect, test } from "bun:test";
import { AlertChannelSmsAdapter } from "../src/alert-channel-sms.adapter";
import { SmsCollectingAdapter } from "../src/sms-collecting.adapter";
import * as mocks from "./mocks";

const Sms = new SmsCollectingAdapter();
const adapter = new AlertChannelSmsAdapter({ message: () => mocks.sms }, { Sms });

describe("AlertChannelSmsAdapter", () => {
  test("send", async () => {
    await adapter.send(mocks.alert);

    expect(Sms.messages).toEqual([mocks.sms]);
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
