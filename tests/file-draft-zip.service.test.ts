import { describe, expect, test } from "bun:test";
import { Readable } from "node:stream";
import * as tools from "@bgord/tools";
import { FileDraft } from "../src/file-draft.service";
import { FileDraftZip } from "../src/file-draft-zip.service";

const bundle = tools.Basename.parse("bundle");
const firstBasename = tools.Basename.parse("first.csv");
const secondBasename = tools.Basename.parse("second.csv");

class Draft extends FileDraft {
  constructor(
    basename: tools.BasenameType,
    private readonly content: string,
  ) {
    super(basename, tools.MIMES.text);
  }
  create() {
    return Readable.from([this.content]);
  }
}

describe("ZipDraft service", () => {
  test("returns a buffer with ZIP signature", async () => {
    const zip = new FileDraftZip(bundle, [new Draft(firstBasename, "alpha")]);

    const buffer = await zip.create();

    expect(buffer.subarray(0, 4).toString("hex")).toEqual("504b0304");
    expect(buffer.length).toBeGreaterThan(22);
  });

  test("embeds all parts", async () => {
    const first = new Draft(firstBasename, "id\n1");
    const second = new Draft(secondBasename, "id\n2");
    const zip = new FileDraftZip(bundle, [first, second]);

    const text = (await zip.create()).toString("utf8");

    expect(text).toContain(firstBasename);
    expect(text).toContain(secondBasename);
  });
});
