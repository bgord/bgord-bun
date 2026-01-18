import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MailerContentHtml } from "../src/mailer-content-html.vo";
import { MailerSubject } from "../src/mailer-subject.vo";
import { MailerTemplate } from "../src/mailer-template.vo";

describe("MailerTemplate", () => {
  test("happy path", () => {
    const config = { from: tools.Email.parse("from@example.com"), to: tools.Email.parse("to@example.com") };
    const message = {
      subject: MailerSubject.parse("Test Email"),
      html: MailerContentHtml.parse("This is a test email."),
    };

    const result = new MailerTemplate(config, message, []).toJSON();

    expect(result).toEqual({ config, message });
  });
});
