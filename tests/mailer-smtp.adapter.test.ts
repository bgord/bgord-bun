import { describe, expect, spyOn, test } from "bun:test";
import * as Nodemailer from "nodemailer";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
import * as testcase from "./testcases";

const cases = testcase.mailer();

const adapter = MailerSmtpAdapter.build(cases.subjects.config, { Nodemailer });

describe("MailerSmtpAdapter", () => {
  test(cases.send.name, async () => {
    using transportSendMail = spyOn(adapter["transport"], "sendMail").mockImplementation(
      async () => ({}) as Nodemailer.SentMessageInfo,
    );

    await adapter.send(cases.send.input);

    expect(transportSendMail).toHaveBeenCalledWith({
      ...cases.send.input.config,
      ...cases.send.input.message,
      attachments: cases.send.input.attachments,
    });
  });

  test(cases.verify.name, async () => {
    using transportVerify = spyOn(adapter["transport"], "verify").mockResolvedValue(cases.verify.output);

    expect(await adapter.verify()).toEqual(cases.verify.output);
    expect(transportVerify).toHaveBeenCalledTimes(1);
  });

  test("build - transport options", () => {
    const built = MailerSmtpAdapter.build(cases.subjects.config, { Nodemailer });

    expect(built["transport"].options as Record<string, unknown>).toEqual({
      host: "smtp.example.com",
      port: 587,
      auth: { user: "user", pass: "pass" },
      requireTLS: true,
    });
  });
});
