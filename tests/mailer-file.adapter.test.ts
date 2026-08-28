import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { MailerFileAdapter } from "../src/mailer-file.adapter";
import { TemporaryFileNoopAdapter } from "../src/temporary-file-noop.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const cases = testcase.mailer();

const directory = v.parse(tools.DirectoryPathAbsoluteSchema, "/tmp");
const TemporaryFile = new TemporaryFileNoopAdapter(directory);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock, TemporaryFile };

const mailer = new MailerFileAdapter(deps);

describe("MailerFileAdapter", () => {
  test(cases.send.name, async () => {
    using temporaryFileWrite = spyOn(TemporaryFile, "write");

    await mailer.send(cases.send.input);

    expect(temporaryFileWrite).toHaveBeenCalledTimes(1);

    // @ts-expect-error Partial access
    const [filename, file] = temporaryFileWrite.mock.calls[0];
    const result = await file.text();

    expect(filename.get()).toEqual(`${Clock.now().ms}.html`);
    expect(result).toEqualIgnoringWhitespace(`
      From: ${cases.send.input.config.from}
      To: ${cases.send.input.config.to}
      Subject: ${cases.send.input.message.subject}
      Date: ${mocks.TIME_ZERO.toInstant().toZonedDateTimeISO("UTC").toPlainDateTime()}
      Attachments: ${cases.send.input.attachments?.length ?? 0}
      ${"-".repeat(50)}
      ${cases.send.input.message.html}
    `);
    expect(result).toContain("\n");
  });

  test(cases.verify.name, async () => {
    expect(await mailer.verify()).toEqual(cases.verify.output);
  });
});
