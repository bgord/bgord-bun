import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { MailerContentHtml } from "../src/mailer-content-html.vo";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
import { MailerSubject } from "../src/mailer-subject.vo";
import { MailerTemplate } from "../src/mailer-template.vo";
import { MailerWithLoggerAdapter } from "../src/mailer-with-logger.adapter";
import { SmtpHost } from "../src/smtp-host.vo";
import { SmtpPass } from "../src/smtp-pass.vo";
import { SmtpPort } from "../src/smtp-port.vo";
import { SmtpUser } from "../src/smtp-user.vo";
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

describe("MailerWithLoggerAdapter", async () => {
  const inner = await MailerSmtpAdapter.build({
    SMTP_HOST: SmtpHost.parse("smtp.example.com"),
    SMTP_PORT: SmtpPort.parse(587),
    SMTP_USER: SmtpUser.parse("user@example.com"),
    SMTP_PASS: SmtpPass.parse("password"),
  });

  test("send - success", async () => {
    const sendMail = spyOn(inner, "send").mockImplementation(jest.fn());
    const Logger = new LoggerCollectingAdapter();
    const adapter = new MailerWithLoggerAdapter({ Logger, inner });

    await adapter.send(template);

    expect(sendMail).toHaveBeenCalledWith(template);
    expect(Logger.entries).toEqual([
      { component: "infra", message: "Mailer attempt", metadata: template.toJSON(), operation: "mailer" },
      {
        component: "infra",
        message: "Mailer success",
        metadata: { template: template.toJSON() },
        operation: "mailer",
      },
    ]);
  });

  test("failure", async () => {
    const sendMail = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);
    const Logger = new LoggerCollectingAdapter();
    const adapter = new MailerWithLoggerAdapter({ Logger, inner });

    expect(async () => adapter.send(template)).toThrow(mocks.IntentionalError);
    expect(sendMail).toHaveBeenCalledWith(template);
    expect(Logger.entries).toEqual([
      { component: "infra", message: "Mailer attempt", metadata: template.toJSON(), operation: "mailer" },
      {
        component: "infra",
        message: "Mailer error",
        operation: "mailer",
        error: new Error(mocks.IntentionalError),
      },
    ]);
  });

  test("verfiy", async () => {
    const mailerSmtpVerify = spyOn(inner, "verify").mockImplementation(jest.fn());
    const Logger = new LoggerCollectingAdapter();
    const adapter = new MailerWithLoggerAdapter({ Logger, inner });

    await adapter.verify();

    expect(mailerSmtpVerify).toHaveBeenCalled();
  });
});
