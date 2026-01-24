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
  test("create", async () => {
    const zip = new FileDraftZip(bundle, [new Draft(firstBasename, extension, "alpha")]);

    const bytes = await zip.create();
    const signature = bytes.subarray(0, 4).toHex();

    expect(signature).toEqual("504b0304");
    expect(bytes.length).toEqual(156);
  });

  test("content", async () => {
    const first = new Draft(firstBasename, extension, "id\n1");
    const second = new Draft(secondBasename, extension, "id\n2");
    const zip = new FileDraftZip(bundle, [first, second]);

    const bytes = await zip.create();
    const text = new TextDecoder().decode(bytes);

    expect(text).toContain(firstBasename);
    expect(text).toContain(secondBasename);
  });

  test("toResponse", async () => {
    const zip = new FileDraftZip(bundle, [
      new Draft(firstBasename, extension, "alpha"),
      new Draft(secondBasename, extension, "beta"),
    ]);

    const response = await zip.toResponse();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(response.headers.get("content-disposition")).toBe(`attachment; filename="${bundle}.zip"`);

    const bytes = new Uint8Array(await response.arrayBuffer());
    const text = new TextDecoder().decode(bytes);
    const signature = bytes.subarray(0, 4).toHex();

    expect(signature).toEqual("504b0304");
    expect(text).toContain(firstBasename);
    expect(text).toContain(secondBasename);
  });
});
