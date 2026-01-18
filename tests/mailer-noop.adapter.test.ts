import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MailerContentHtml } from "../src/mailer-content-html.vo";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import { MailerSubject } from "../src/mailer-subject.vo";
import { MailerTemplate } from "../src/mailer-template.vo";

const mailer = new MailerNoopAdapter();

describe("MailerNoopAdapter", () => {
  test("send - success", async () => {
    const config = {
      from: tools.Email.parse("sender@example.com"),
      to: tools.Email.parse("recipient@example.com"),
    };
    const message = {
      subject: MailerSubject.parse("Test Email"),
      html: MailerContentHtml.parse("This is a test email."),
    };
    const template = new MailerTemplate(config, message);

    expect(async () => mailer.send(template)).not.toThrow();
  });

  test("verify", async () => {
    expect(await mailer.verify()).toEqual(true);
  });
});
