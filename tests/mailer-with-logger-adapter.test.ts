import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
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
const message = { subject: "Test Email", html: "This is a test email." };
const template = new MailerTemplate(config, message);

const Logger = new LoggerNoopAdapter();

describe("MailerWithLoggerAdapter", async () => {
  const inner = await MailerSmtpAdapter.build({
    SMTP_HOST: SmtpHost.parse("smtp.example.com"),
    SMTP_PORT: SmtpPort.parse(587),
    SMTP_USER: SmtpUser.parse("user@example.com"),
    SMTP_PASS: SmtpPass.parse("password"),
  });
  const deps = { Logger, inner };

  const mailer = new MailerWithLoggerAdapter(deps);

  test("send - success", async () => {
    const sendMail = spyOn(inner, "send").mockImplementation(jest.fn());
    const loggerInfo = spyOn(Logger, "info");

    await mailer.send(template);

    expect(sendMail).toHaveBeenCalledWith(template);
    expect(loggerInfo).toHaveBeenNthCalledWith(1, {
      component: "infra",
      message: "Mailer attempt",
      metadata: template.toJSON(),
      operation: "mailer",
    });
    expect(loggerInfo).toHaveBeenNthCalledWith(2, {
      component: "infra",
      message: "Mailer success",
      metadata: { template: template.toJSON() },
      operation: "mailer",
    });
  });

  test("failure", async () => {
    const sendMail = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);
    const loggerError = spyOn(Logger, "error");

    expect(async () => mailer.send(template)).toThrow(mocks.IntentionalError);
    expect(sendMail).toHaveBeenCalledWith(template);
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ component: "infra", message: "Mailer error", operation: "mailer" }),
    );
  });

  test("verfiy", async () => {
    const mailerSmtpVerify = spyOn(inner, "verify").mockImplementation(jest.fn());

    await mailer.verify();

    expect(mailerSmtpVerify).toHaveBeenCalled();
  });
});
