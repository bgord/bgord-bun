import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { MailerContentHtml } from "../src/mailer-content-html.vo";
import { MailerSubject } from "../src/mailer-subject.vo";
import { MailerTemplate } from "../src/mailer-template.vo";

describe("MailerTemplate", () => {
  test("happy path", () => {
    const config = {
      from: v.parse(tools.Email, "from@example.com"),
      to: v.parse(tools.Email, "to@example.com"),
    };
    const message = {
      subject: v.parse(MailerSubject, "Test Email"),
      html: v.parse(MailerContentHtml, "This is a test email."),
    };

    const result = new MailerTemplate(config, message, []).toJSON();

    expect(result).toEqual({ config, message, attachments: 0 });
  });
});
