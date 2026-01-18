import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MailerResendAdapter } from "../src/mailer-resend.adapter";
import { MailerTemplate } from "../src/mailer-template.vo";
import * as mocks from "./mocks";

const config = {
  from: tools.Email.parse("sender@example.com"),
  to: tools.Email.parse("recipient@example.com"),
};
const notification = new tools.NotificationTemplate("Test Email", "This is a test email.");
const message = new MailerTemplate(config, notification);

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

    await mailer.send(message);

    expect(resendEmailsSend).toHaveBeenCalledWith({ ...config, ...notification.get() });
  });

  test("send - error", async () => {
    spyOn(mailer.transport.emails, "send").mockResolvedValue(failure);

    try {
      await mailer.send(message);
      throw new Error("Expected send() to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toEqual("Invalid API key");
      expect((error as Error).name).toEqual("validation_error");
    }
  });

  test("verify - success", async () => {
    expect(await mailer.verify()).toEqual(true);
  });

  test("missing dependency", async () => {
    spyOn(MailerResendAdapter, "import").mockRejectedValue(mocks.IntentionalError);

    expect(MailerResendAdapter.build(smtp)).rejects.toThrow("mailer.resend.adapter.error.missing.dependency");
  });
});
