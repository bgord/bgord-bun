import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileDraft } from "../src/file-draft.service";
import { FileDraftZip } from "../src/file-draft-zip.service";
import * as mocks from "./mocks";

const bundle = tools.Basename.parse("bundle");
const extension = tools.Extension.parse("csv");

const first = tools.Basename.parse("first.csv");
const second = tools.Basename.parse("second.csv");

const content = "content";

class Draft extends FileDraft {
  constructor(
    basename: tools.BasenameType,
    extension: tools.ExtensionType,
    private readonly content: string,
  ) {
    super(basename, extension, tools.Mimes.text.mime);
  }

  async create(): Promise<BodyInit> {
    return this.content;
  }
}

class FailingDraft extends FileDraft {
  constructor() {
    super(tools.Basename.parse("fail"), tools.Extension.parse("txt"), tools.Mimes.text.mime);
  }

  async create(): Promise<BodyInit> {
    throw new Error(mocks.IntentionalError);
  }
}

describe("FileDraftZip service", () => {
  test("create", async () => {
    const zip = new FileDraftZip(bundle, [
      new Draft(first, extension, content),
      new Draft(second, extension, content),
    ]);

    const body = await zip.create();
    const bytes = new Uint8Array(await new Response(body).arrayBuffer());
    const signature = bytes.subarray(0, 4).toHex();
    const text = new TextDecoder().decode(bytes);

    expect(signature).toEqual("504b0304");
    expect(text).toContain(first);
    expect(text).toContain(second);
    expect(bytes.length).toEqual(296);
  });

  test("create - empty", async () => {
    const zip = new FileDraftZip(bundle, []);

    const body = await zip.create();
    const bytes = new Uint8Array(await new Response(body).arrayBuffer());

    expect(bytes.subarray(0, 4).toHex()).toEqual("504b0506");
    expect(bytes.length).toEqual(22);
  });

  test("create - failure", async () => {
    const zip = new FileDraftZip(bundle, [new FailingDraft()]);

    expect(async () => zip.create()).toThrow(mocks.IntentionalError);
  });

  test("getHeaders", () => {
    const zip = new FileDraftZip(bundle, [new Draft(first, extension, content)]);

    expect(zip.getHeaders().toJSON()).toEqual({
      "content-type": tools.Mimes.zip.mime.toString(),
      "content-disposition": `attachment; filename="${bundle}.zip"`,
    });
  });

  test("toResponse", async () => {
    const zip = new FileDraftZip(bundle, [
      new Draft(first, extension, content),
      new Draft(second, extension, content),
    ]);

    const response = await zip.toResponse();

    expect(response.status).toEqual(200);
    expect(response.headers.get("content-type")).toEqual("application/zip");
    expect(response.headers.get("content-disposition")).toEqual(`attachment; filename="${bundle}.zip"`);

    const bytes = new Uint8Array(await response.arrayBuffer());
    const signature = bytes.subarray(0, 4).toHex();
    const text = new TextDecoder().decode(bytes);

    expect(signature).toEqual("504b0304");
    expect(text).toContain(first);
    expect(text).toContain(second);
  });
});
