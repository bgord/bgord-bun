import { describe, expect, test } from "bun:test";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import * as testcase from "./testcases";

const cases = testcase.mailer();

const mailer = new MailerNoopAdapter();

describe("MailerNoopAdapter", () => {
  test(cases.send.name, async () => {
    expect(async () => mailer.send(cases.send.input)).not.toThrow();
  });

  test(cases.verify.name, async () => {
    expect(await mailer.verify()).toEqual(cases.verify.output);
  });
});
