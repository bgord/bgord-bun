import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
import { MailerTemplate } from "../src/mailer-template.vo";
import { SmtpHost } from "../src/smtp-host.vo";
import { SmtpPass } from "../src/smtp-pass.vo";
import { SmtpPort } from "../src/smtp-port.vo";
import { SmtpUser } from "../src/smtp-user.vo";
import * as mocks from "./mocks";

const smtp = {
  SMTP_HOST: SmtpHost.parse("smtp.example.com"),
  SMTP_PORT: SmtpPort.parse(587),
  SMTP_USER: SmtpUser.parse("user@example.com"),
  SMTP_PASS: SmtpPass.parse("password"),
};

const config = {
  from: tools.Email.parse("sender@example.com"),
  to: tools.Email.parse("recipient@example.com"),
};
const notification = new tools.NotificationTemplate("Test Email", "This is a test email.");
const message = new MailerTemplate(config, notification);

describe("MailerSmtpAdapter", () => {
  test("send - success", async () => {
    const sendMail = spyOn({ sendMail: async () => {} }, "sendMail");
    const createTransport = spyOn(MailerSmtpAdapter, "import").mockResolvedValue({
      createTransport: () => ({ sendMail }),
    } as any);
    const mailer = await MailerSmtpAdapter.build(smtp);

    await mailer.send(message);

    expect(sendMail).toHaveBeenCalledWith({ ...config, ...notification.get(), attachments: undefined });
    expect(createTransport).toHaveBeenCalled();
  });

  test("verify - success", async () => {
    const verify = spyOn({ verify: async () => true }, "verify");
    spyOn(MailerSmtpAdapter, "import").mockResolvedValue({
      createTransport: () => ({ verify }),
    } as any);
    const mailer = await MailerSmtpAdapter.build(smtp);

    await mailer.verify();

    expect(verify).toHaveBeenCalled();
  });

  test("missing dependency", async () => {
    spyOn(MailerSmtpAdapter, "import").mockRejectedValue(mocks.IntentionalError);

    expect(MailerSmtpAdapter.build(smtp)).rejects.toThrow("mailer.smtp.adapter.error.missing.dependency");
  });
});
