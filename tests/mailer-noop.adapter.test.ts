import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { MailerContentHtml } from "../src/mailer-content-html.vo";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import { MailerSubject } from "../src/mailer-subject.vo";
import { MailerTemplate } from "../src/mailer-template.vo";

const mailer = new MailerNoopAdapter();

describe("MailerNoopAdapter", () => {
  test("send - success", async () => {
    const config = {
      from: v.parse(tools.Email, "sender@example.com"),
      to: v.parse(tools.Email, "recipient@example.com"),
    };
    const message = {
      subject: v.parse(MailerSubject, "Test Email"),
      html: v.parse(MailerContentHtml, "This is a test email."),
    };
    const template = new MailerTemplate(config, message);

    expect(async () => mailer.send(template)).not.toThrow();
  });

  test("verify", async () => {
    expect(await mailer.verify()).toEqual(true);
  });
});
