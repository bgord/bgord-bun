import { describe, expect, test } from "bun:test";
import { AlertChannelMailerAdapter } from "../src/alert-channel-mailer.adapter";
import { MailerCollectingAdapter } from "../src/mailer-collecting.adapter";
import * as mocks from "./mocks";

const Mailer = new MailerCollectingAdapter();
const adapter = new AlertChannelMailerAdapter({ template: () => mocks.template }, { Mailer });

describe("AlertChannelMailerAdapter", () => {
  test("send", async () => {
    await adapter.send(mocks.alert);

    expect(Mailer.messages).toEqual([mocks.template]);
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
