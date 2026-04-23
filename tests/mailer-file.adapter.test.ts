import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { MailerFileAdapter } from "../src/mailer-file.adapter";
import { TemporaryFileNoopAdapter } from "../src/temporary-file-noop.adapter";
import * as mocks from "./mocks";

const directory = v.parse(tools.DirectoryPathAbsoluteSchema, "/tmp");
const TemporaryFile = new TemporaryFileNoopAdapter(directory);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock, TemporaryFile };

const mailer = new MailerFileAdapter(deps);

describe("MailerFileAdapter", () => {
  test("send - success", async () => {
    using temporaryFileWrite = spyOn(TemporaryFile, "write");

    await mailer.send(mocks.template);

    expect(temporaryFileWrite).toHaveBeenCalledTimes(1);

    // @ts-expect-error Partial access
    const [filename, file] = temporaryFileWrite.mock.calls[0];

    expect(filename.get()).toEqual(`${Clock.now().ms}.html`);
    expect(await file.text()).toEqualIgnoringWhitespace(`
      From: ${mocks.template.config.from}
      To: ${mocks.template.config.to}
      Subject: ${mocks.template.message.subject}
      Date: ${mocks.TIME_ZERO.toInstant().toZonedDateTimeISO("UTC").toPlainDateTime()}
      Attachments: ${mocks.template.attachments?.length ?? 0}
      ${"-".repeat(50)}
      ${mocks.template.message.html}
    `);
  });

  test("verify", async () => {
    expect(await mailer.verify()).toEqual(true);
  });
});
