import { describe, expect, test } from "bun:test";
import { AlertChannelMailerAdapter } from "../src/alert-channel-mailer.adapter";
import { MailerCollectingAdapter } from "../src/mailer-collecting.adapter";
import * as testcase from "./testcases";

const cases = testcase.alertChannel();

const Mailer = new MailerCollectingAdapter();
const adapter = new AlertChannelMailerAdapter({ template: () => cases.subjects.template }, { Mailer });

describe("AlertChannelMailerAdapter", () => {
  test(cases.send.name, async () => {
    await adapter.send(cases.send.input);

    expect(Mailer.messages).toEqual([cases.subjects.template]);
  });

  test(cases.verify.name, async () => {
    expect(await adapter.verify()).toEqual(cases.verify.output);
  });
});
