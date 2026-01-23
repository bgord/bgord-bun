import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MailerContentHtml } from "../src/mailer-content-html.vo";
import { MailerResendAdapter } from "../src/mailer-resend.adapter";
import { MailerSubject } from "../src/mailer-subject.vo";
import { MailerTemplate } from "../src/mailer-template.vo";
import * as mocks from "./mocks";

const config = {
  from: tools.Email.parse("sender@example.com"),
  to: tools.Email.parse("recipient@example.com"),
};
const message = {
  subject: MailerSubject.parse("Test Email"),
  html: MailerContentHtml.parse("This is a test email."),
};
const template = new MailerTemplate(config, message);

const smtp = { key: "RESEND_API_KEY" };

const success = { error: null, data: { id: "first" }, headers: null };
const failure = {
  error: { message: "Invalid API key", statusCode: 401, name: "validation_error" },
  data: null,
  headers: null,
} as const;

describe("MailerResendAdapter", async () => {
  const mailer = await MailerResendAdapter.build(smtp);

  test("send - success", async () => {
    const resendEmailsSend = spyOn(mailer.transport.emails, "send").mockResolvedValue(success);

    await mailer.send(template);

    expect(resendEmailsSend).toHaveBeenCalledWith({ ...config, ...message });
  });

  test("send - error", async () => {
    spyOn(mailer.transport.emails, "send").mockResolvedValue(failure);

    expect(async () => mailer.send(template)).toThrow("Invalid API key");
  });

  test("verify - success", async () => {
    expect(await mailer.verify()).toEqual(true);
  });

  test("missing dependency", async () => {
    spyOn(MailerResendAdapter, "import").mockRejectedValue(mocks.IntentionalError);

    expect(MailerResendAdapter.build(smtp)).rejects.toThrow("mailer.resend.adapter.error.missing.dependency");
  });
});
