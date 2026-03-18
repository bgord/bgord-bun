import { describe, expect, spyOn, test } from "bun:test";
import { MailerResendAdapter } from "../src/mailer-resend.adapter";
import * as mocks from "./mocks";

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
    using resendEmailsSend = spyOn(mailer.transport.emails, "send").mockResolvedValue(success);

    await mailer.send(mocks.template);

    expect(resendEmailsSend).toHaveBeenCalledWith({ ...mocks.mailer.config, ...mocks.mailer.message });
  });

  test("send - error", async () => {
    using _ = spyOn(mailer.transport.emails, "send").mockResolvedValue(failure);

    expect(async () => mailer.send(mocks.template)).toThrow("Invalid API key");
  });

  test("verify - success", async () => {
    expect(await mailer.verify()).toEqual(true);
  });

  test("missing dependency", async () => {
    // @ts-expect-error Private method
    using _ = spyOn(MailerResendAdapter["importer"], "import").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );

    expect(async () => MailerResendAdapter.build(smtp)).toThrow(
      "mailer.resend.adapter.error.missing.dependency",
    );
  });

  test("import", async () => {
    // @ts-expect-error Private method
    using obfuscateSpy = spyOn(MailerResendAdapter["importer"], "obfuscate");

    await MailerResendAdapter.build(smtp);

    expect(obfuscateSpy).toHaveBeenCalledWith("resend");
  });
});
