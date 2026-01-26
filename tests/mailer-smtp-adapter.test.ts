import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MailerContentHtml } from "../src/mailer-content-html.vo";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
import { MailerSubject } from "../src/mailer-subject.vo";
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
const message = {
  subject: MailerSubject.parse("Test Email"),
  html: MailerContentHtml.parse("This is a test email."),
};
const template = new MailerTemplate(config, message);

describe("MailerSmtpAdapter", () => {
  test("send - success", async () => {
    const sendMail = spyOn({ sendMail: async () => {} }, "sendMail");
    const createTransport = spyOn(MailerSmtpAdapter, "import").mockResolvedValue({
      // @ts-expect-error Partial access
      createTransport: () => ({ sendMail }),
    });
    const mailer = await MailerSmtpAdapter.build(smtp);

    await mailer.send(template);

    expect(sendMail).toHaveBeenCalledWith({ ...config, ...message });
    expect(createTransport).toHaveBeenCalled();
  });

  test("verify - success", async () => {
    const verify = spyOn({ verify: async () => true }, "verify");
    // @ts-expect-error Partial access
    spyOn(MailerSmtpAdapter, "import").mockResolvedValue({ createTransport: () => ({ verify }) });
    const mailer = await MailerSmtpAdapter.build(smtp);

    await mailer.verify();

    expect(verify).toHaveBeenCalled();
  });

  test("build", async () => {
    const createTransport = spyOn(
      { createTransport: () => ({ sendMail: async () => {} }) },
      "createTransport",
    );
    // @ts-expect-error Partial access
    spyOn(MailerSmtpAdapter, "import").mockResolvedValue({ createTransport });

    await MailerSmtpAdapter.build(smtp);

    expect(createTransport).toHaveBeenCalledWith({
      host: smtp.SMTP_HOST,
      port: smtp.SMTP_PORT,
      auth: { user: smtp.SMTP_USER, pass: smtp.SMTP_PASS },
    });
  });

  test("missing dependency", async () => {
    spyOn(MailerSmtpAdapter, "import").mockRejectedValue(mocks.IntentionalError);

    expect(async () => MailerSmtpAdapter.build(smtp)).toThrow("mailer.smtp.adapter.error.missing.dependency");
  });
});
