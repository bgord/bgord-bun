import { describe, expect, test } from "bun:test";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";

const mailer = new MailerNoopAdapter();

describe("MailerNoopAdapter", () => {
  test("send - success", async () => {
    const sendOptions = {
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    };

    expect(async () => mailer.send(sendOptions)).not.toThrow();
  });

  test("verify", async () => {
    expect(await mailer.verify()).toEqual(true);
  });
});
