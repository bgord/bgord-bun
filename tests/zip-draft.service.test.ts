import { describe, expect, test } from "bun:test";
import { Readable } from "node:stream";
import * as tools from "@bgord/tools";
import { FileDraft } from "../src/file-draft.service";
import { FileDraftZip } from "../src/file-draft-zip.service";

class Draft extends FileDraft {
  constructor(
    filename: string,
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
    const zip = new FileDraftZip({ filename: "bundle.zip", parts: [new Draft("a.txt", "alpha")] });

    const buffer = await zip.create();

    expect(buffer.subarray(0, 4).toString("hex")).toEqual("504b0304");
    expect(buffer.length).toBeGreaterThan(22);
  });

  test("embeds all parts", async () => {
    const first = new Draft("first.csv", "id\n1");
    const second = new Draft("second.csv", "id\n2");

    const zip = new FileDraftZip({ filename: "two.csv.zip", parts: [first, second] });

    const text = (await zip.create()).toString("utf8");

    expect(text).toContain("first.csv");
    expect(text).toContain("second.csv");
  });
});
