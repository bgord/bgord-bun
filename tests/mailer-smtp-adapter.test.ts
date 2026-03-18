import { describe, expect, spyOn, test } from "bun:test";
import * as v from "valibot";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
import { SmtpHost } from "../src/smtp-host.vo";
import { SmtpPass } from "../src/smtp-pass.vo";
import { SmtpPort } from "../src/smtp-port.vo";
import { SmtpUser } from "../src/smtp-user.vo";
import * as mocks from "./mocks";

const smtp = {
  SMTP_HOST: v.parse(SmtpHost, "smtp.example.com"),
  SMTP_PORT: v.parse(SmtpPort, 587),
  SMTP_USER: v.parse(SmtpUser, "user@example.com"),
  SMTP_PASS: v.parse(SmtpPass, "password"),
};

describe("MailerSmtpAdapter", () => {
  test("send - success", async () => {
    using sendMail = spyOn({ sendMail: async () => {} }, "sendMail");
    // @ts-expect-error Private method
    using createTransport = spyOn(MailerSmtpAdapter["importer"], "import").mockResolvedValue({
      // @ts-expect-error Partial access
      createTransport: () => ({ sendMail }),
    });
    const mailer = await MailerSmtpAdapter.build(smtp);

    await mailer.send(mocks.template);

    expect(sendMail).toHaveBeenCalledWith({ ...mocks.mailer.config, ...mocks.mailer.message });
    expect(createTransport).toHaveBeenCalled();
  });

  test("verify - success", async () => {
    using verify = spyOn({ verify: async () => true }, "verify");
    // @ts-expect-error Private method
    using _ = spyOn(MailerSmtpAdapter["importer"], "import").mockResolvedValue({
      // @ts-expect-error Partial access
      createTransport: () => ({ verify }),
    });
    const mailer = await MailerSmtpAdapter.build(smtp);

    await mailer.verify();

    expect(verify).toHaveBeenCalled();
  });

  test("build", async () => {
    using createTransport = spyOn(
      { createTransport: () => ({ sendMail: async () => {} }) },
      "createTransport",
    );
    // @ts-expect-error Private method
    using _ = spyOn(MailerSmtpAdapter["importer"], "import").mockResolvedValue({
      // @ts-expect-error Partial access
      createTransport,
    });

    await MailerSmtpAdapter.build(smtp);

    expect(createTransport).toHaveBeenCalledWith({
      host: smtp.SMTP_HOST,
      port: smtp.SMTP_PORT,
      auth: { user: smtp.SMTP_USER, pass: smtp.SMTP_PASS },
    });
  });

  test("missing dependency", async () => {
    // @ts-expect-error Private method
    using _ = spyOn(MailerSmtpAdapter["importer"], "import").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );

    expect(async () => MailerSmtpAdapter.build(smtp)).toThrow("mailer.smtp.adapter.error.missing.dependency");
  });

  test("import", async () => {
    // @ts-expect-error Private method
    using obfuscateSpy = spyOn(MailerSmtpAdapter["importer"], "obfuscate");

    await MailerSmtpAdapter.build(smtp);

    expect(obfuscateSpy).toHaveBeenCalledWith("nodemailer");
  });
});
