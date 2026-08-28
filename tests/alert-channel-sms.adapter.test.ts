import { describe, expect, test } from "bun:test";
import { AlertChannelSmsAdapter } from "../src/alert-channel-sms.adapter";
import { SmsCollectingAdapter } from "../src/sms-collecting.adapter";
import * as testcase from "./testcases";

const cases = testcase.alertChannel();

const Sms = new SmsCollectingAdapter();
const adapter = new AlertChannelSmsAdapter({ message: () => cases.subjects.sms }, { Sms });

describe("AlertChannelSmsAdapter", () => {
  test(cases.send.name, async () => {
    await adapter.send(cases.send.input);

    expect(Sms.messages).toEqual([cases.subjects.sms]);
  });

  test(cases.verify.name, async () => {
    expect(await adapter.verify()).toEqual(cases.verify.output);
  });
});
