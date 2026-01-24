import { describe, expect, test } from "bun:test";
import { Readable } from "node:stream";
import * as tools from "@bgord/tools";
import { FileDraft } from "../src/file-draft.service";
import { FileDraftZip } from "../src/file-draft-zip.service";

const bundle = tools.Basename.parse("bundle");

const extension = tools.Extension.parse("csv");
const firstBasename = tools.Basename.parse("first.csv");
const secondBasename = tools.Basename.parse("second.csv");

class Draft extends FileDraft {
  constructor(
    basename: tools.BasenameType,
    extension: tools.ExtensionType,
    private readonly content: string,
  ) {
    super(basename, extension, tools.Mimes.text.mime);
  }

  create() {
    return Readable.from([this.content]);
  }
}

describe("FileDraftZip service", () => {
  test("returns ZIP bytes with correct signature", async () => {
    const zip = new FileDraftZip(bundle, [new Draft(firstBasename, extension, "alpha")]);

    const bytes = await zip.create();
    const signature = bytes.subarray(0, 4).toHex();

    expect(signature).toEqual("504b0304");
    expect(bytes.length).toBeGreaterThan(22);
  });

  test("embeds all parts", async () => {
    const first = new Draft(firstBasename, extension, "id\n1");
    const second = new Draft(secondBasename, extension, "id\n2");

    const zip = new FileDraftZip(bundle, [first, second]);

    const bytes = await zip.create();
    const text = new TextDecoder().decode(bytes);

    expect(text).toContain(firstBasename);
    expect(text).toContain(secondBasename);
  });
});
