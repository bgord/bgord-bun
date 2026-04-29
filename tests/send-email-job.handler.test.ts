import { describe, expect, spyOn, test } from "bun:test";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import { SendEmailJobHandler } from "../src/modules/system/job-handlers";
import * as mocks from "./mocks";

const Mailer = new MailerNoopAdapter();
const deps = { Mailer };

describe("SendEmailJobHandler", async () => {
  test("happy path", async () => {
    using send = spyOn(Mailer, "send");

    await SendEmailJobHandler(deps)(mocks.GenericSendEmailJob);

    expect(send).toHaveBeenCalledWith({
      attachments: undefined,
      config: { from: mocks.GenericSendEmailJob.payload.from, to: mocks.GenericSendEmailJob.payload.to },
      message: {
        subject: mocks.GenericSendEmailJob.payload.subject,
        html: mocks.GenericSendEmailJob.payload.html,
      },
    });
  });
});
