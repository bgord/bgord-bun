import { describe, expect, test } from "bun:test";
import { Readable } from "node:stream";
import * as tools from "@bgord/tools";
import { FileDraft } from "../src/file-draft.service";
import { FileDraftZip } from "../src/file-draft-zip.service";

class MockDraft extends FileDraft {
  constructor(
    filename: string,
    private readonly content: string,
  ) {
    super({ filename, mime: new tools.Mime("text/plain") });
  }
  create() {
    return Readable.from([this.content]); // Node Readable ⚑
  }
}

describe("ZipDraft", () => {
  test("ZipDraft returns a buffer with ZIP signature", async () => {
    const zip = new FileDraftZip({ filename: "bundle.zip", parts: [new MockDraft("a.txt", "alpha")] });

    const buf = await zip.create();

    // 0x50 0x4b 0x03 0x04 = "PK\003\004"
    expect(buf.subarray(0, 4).toString("hex")).toBe("504b0304");
    expect(buf.length).toBeGreaterThan(22); // > local-file header size
  });

  test("ZipDraft embeds all parts", async () => {
    const draftA = new MockDraft("first.csv", "id\n1");
    const draftB = new MockDraft("second.csv", "id\n2");

    const zip = new FileDraftZip({ filename: "two.csv.zip", parts: [draftA, draftB] });

    const buf = await zip.create();
    const txt = buf.toString("utf8");

    expect(txt).toContain("first.csv");
    expect(txt).toContain("second.csv");
  });
});
