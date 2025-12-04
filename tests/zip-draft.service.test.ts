import { describe, expect, test } from "bun:test";
import { Readable } from "node:stream";
import * as tools from "@bgord/tools";
import { FileDraft } from "../src/file-draft.service";
import { FileDraftZip } from "../src/file-draft-zip.service";

const bundle = tools.Filename.fromString("bundle.zip");
const firstFilename = tools.Filename.fromString("first.csv");
const secondFilename = tools.Filename.fromString("second.csv");

class Draft extends FileDraft {
  constructor(
    filename: tools.Filename,
    private readonly content: string,
  ) {
    super({ filename, mime: tools.MIMES.text });
  }
  create() {
    return Readable.from([this.content]);
  }
}

describe("ZipDraft service", () => {
  test("returns a buffer with ZIP signature", async () => {
    const zip = new FileDraftZip({ filename: bundle, parts: [new Draft(firstFilename, "alpha")] });

    const buffer = await zip.create();

    expect(buffer.subarray(0, 4).toString("hex")).toEqual("504b0304");
    expect(buffer.length).toBeGreaterThan(22);
  });

  test("embeds all parts", async () => {
    const first = new Draft(firstFilename, "id\n1");
    const second = new Draft(secondFilename, "id\n2");

    const zip = new FileDraftZip({ filename: bundle, parts: [first, second] });

    const text = (await zip.create()).toString("utf8");

    expect(text).toContain(firstFilename.get());
    expect(text).toContain(secondFilename.get());
  });
});
