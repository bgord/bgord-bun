import { describe, expect, test } from "bun:test";
import { MailerCollectingAdapter } from "../src/mailer-collecting.adapter";
import * as testcase from "./testcases";

const cases = testcase.mailer();

const adapter = new MailerCollectingAdapter();

describe("MailerCollectingAdapter", () => {
  test(cases.send.name, async () => {
    await adapter.send(cases.send.input);

    expect(adapter.messages).toEqual([cases.send.input]);
  });

  test(cases.verify.name, async () => {
    expect(await adapter.verify()).toEqual(cases.verify.output);
  });
});
