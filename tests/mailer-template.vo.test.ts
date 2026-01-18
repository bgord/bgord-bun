import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MailerTemplate } from "../src/mailer-template.vo";

describe("MailerTemplate", () => {
  test("happy path", () => {
    const config = { from: tools.Email.parse("from@example.com"), to: tools.Email.parse("to@example.com") };
    const message = { subject: "", html: "" };
    const attachments = [];

    const result = new MailerTemplate(config, message, attachments).toJSON();

    expect(result).toEqual({ config, message });
  });
});
