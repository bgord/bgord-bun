import { describe, expect, spyOn, test } from "bun:test";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const cases = testcase.mailer();

const adapter = await MailerSmtpAdapter.build(cases.subjects.config);

describe("MailerSmtpAdapter", () => {
  test(cases.send.name, async () => {
    using transportSendMail = spyOn(adapter["transport"], "sendMail").mockResolvedValue(undefined);

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

  test("build - transport options", async () => {
    const built = await MailerSmtpAdapter.build(cases.subjects.config);

    expect(built["transport"].options as Record<string, unknown>).toEqual({
      host: "smtp.example.com",
      port: 587,
      auth: { user: "user", pass: "pass" },
      requireTLS: true,
    });
  });

  test("missing dependency", async () => {
    // @ts-expect-error Private method
    using _ = spyOn(MailerSmtpAdapter["importer"], "import").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );

    expect(async () => MailerSmtpAdapter.build(cases.subjects.config)).toThrow(
      "mailer.smtp.adapter.error.missing.dependency",
    );
  });

  test("import", async () => {
    // @ts-expect-error Private method
    using obfuscateSpy = spyOn(MailerSmtpAdapter["importer"], "obfuscate");

    await MailerSmtpAdapter.build(cases.subjects.config);

    expect(obfuscateSpy).toHaveBeenCalledWith("nodemailer");
  });
});
