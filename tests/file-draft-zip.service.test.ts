import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileDraft } from "../src/file-draft.service";
import { FileDraftZip } from "../src/file-draft-zip.service";
import * as mocks from "./mocks";

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
    const zip = new FileDraftZip(bundle, [new Draft(firstBasename, extension, "alpha")]);

    const body = await zip.create();
    const bytes = new Uint8Array(await new Response(body).arrayBuffer());
    const signature = bytes.subarray(0, 4).toHex();

    expect(signature).toEqual("504b0304");
    expect(bytes.length).toBeGreaterThan(22);
  });

  test("create - parts inspection", async () => {
    const zip = new FileDraftZip(bundle, [
      new Draft(firstBasename, extension, "id\n1"),
      new Draft(secondBasename, extension, "id\n2"),
    ]);

    const body = await zip.create();
    const bytes = new Uint8Array(await new Response(body).arrayBuffer());
    const text = new TextDecoder().decode(bytes);

    expect(text).toContain(firstBasename);
    expect(text).toContain(secondBasename);
  });

  test("create - failure", async () => {
    const zip = new FileDraftZip(bundle, [new FailingDraft()]);

    expect(async () => zip.create()).toThrow(mocks.IntentionalError);
  });

  test("getHeaders", () => {
    const zip = new FileDraftZip(bundle, [new Draft(firstBasename, extension, "alpha")]);

    expect(zip.getHeaders().toJSON()).toEqual({
      "content-type": tools.Mimes.zip.mime.toString(),
      "content-disposition": `attachment; filename="${bundle}.zip"`,
    });
  });

  test("toResponse", async () => {
    const zip = new FileDraftZip(bundle, [
      new Draft(firstBasename, extension, "alpha"),
      new Draft(secondBasename, extension, "beta"),
    ]);

    const response = await zip.toResponse();

    expect(response.status).toEqual(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(response.headers.get("content-disposition")).toBe(`attachment; filename="${bundle}.zip"`);

    const bytes = new Uint8Array(await response.arrayBuffer());
    const signature = bytes.subarray(0, 4).toHex();
    const text = new TextDecoder().decode(bytes);

    expect(signature).toEqual("504b0304");
    expect(text).toContain(firstBasename);
    expect(text).toContain(secondBasename);
  });
});
