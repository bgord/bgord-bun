import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import { MailerTemplate } from "../src/mailer-template.vo";

const mailer = new MailerNoopAdapter();

describe("MailerNoopAdapter", () => {
  test("send - success", async () => {
    const config = {
      from: tools.Email.parse("sender@example.com"),
      to: tools.Email.parse("recipient@example.com"),
    };
    const notification = new tools.NotificationTemplate("Test Email", "This is a test email.");
    const message = new MailerTemplate(config, notification);

    expect(async () => mailer.send(message)).not.toThrow();
  });

  test("verify", async () => {
    expect(await mailer.verify()).toEqual(true);
  });
});
