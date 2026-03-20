import { describe, expect, test } from "bun:test";
import { MailerCollectingAdapter } from "../src/mailer-collecting.adapter";
import * as mocks from "./mocks";

const adapter = new MailerCollectingAdapter();

describe("MailerCollectingAdapter", () => {
  test("send", async () => {
    await adapter.send(mocks.template);

    expect(adapter.messages).toEqual([mocks.template]);
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
