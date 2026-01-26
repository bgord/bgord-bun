import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
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
    const zip = await FileDraftZip.build(bundle, [
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
    const zip = await FileDraftZip.build(bundle, []);

    const body = await zip.create();
    const bytes = new Uint8Array(await new Response(body).arrayBuffer());

    expect(bytes.subarray(0, 4).toHex()).toEqual("504b0506");
    expect(bytes.length).toEqual(22);
  });

  test("create - failure", async () => {
    const zip = await FileDraftZip.build(bundle, [new FailingDraft()]);

    expect(async () => zip.create()).toThrow(mocks.IntentionalError);
  });

  test("getHeaders", async () => {
    const zip = await FileDraftZip.build(bundle, [new Draft(first, extension, content)]);

    expect(zip.getHeaders().toJSON()).toEqual({
      "content-type": tools.Mimes.zip.mime.toString(),
      "content-disposition": `attachment; filename="${bundle}.zip"`,
    });
  });

  test("toResponse", async () => {
    const zip = await FileDraftZip.build(bundle, [
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

  test("toResponse - endpoint", async () => {
    const app = new Hono().get("/export", async () => {
      const zip = await FileDraftZip.build(bundle, [
        new Draft(tools.Basename.parse("first.csv"), extension, "a"),
        new Draft(tools.Basename.parse("second.csv"), extension, "b"),
      ]);

      return zip.toResponse();
    });

    const response = await app.request("/export");

    expect(response.status).toEqual(200);
    expect(response.headers.get("content-type")).toEqual("application/zip");
    expect(response.headers.get("content-disposition")).toEqual(`attachment; filename="${bundle}.zip"`);

    const bytes = new Uint8Array(await response.arrayBuffer());
    const signature = bytes.subarray(0, 4).toHex();
    const text = new TextDecoder().decode(bytes);

    expect(signature).toEqual("504b0304");
    expect(text).toContain("first.csv");
    expect(text).toContain("second.csv");
  });

  test("missing dependency", async () => {
    spyOn(FileDraftZip, "import").mockRejectedValue(mocks.IntentionalError);

    expect(
      FileDraftZip.build(bundle, [
        new Draft(first, extension, content),
        new Draft(second, extension, content),
      ]),
    ).rejects.toThrow("file.draft.zip.error.missing.dependency");
  });
});
