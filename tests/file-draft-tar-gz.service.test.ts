import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import * as v from "valibot";
import { FileDraft } from "../src/file-draft.service";
import { FileDraftTarGz } from "../src/file-draft-tar-gz.service";
import * as mocks from "./mocks";

const bundle = v.parse(tools.Basename, "bundle");
const extension = v.parse(tools.Extension, "csv");

const first = v.parse(tools.Basename, "first");
const second = v.parse(tools.Basename, "second");

const content = "content";

const identifier = "1f8b08";

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
    super(v.parse(tools.Basename, "fail"), v.parse(tools.Extension, "txt"), tools.Mimes.text.mime);
  }

  async create(): Promise<BodyInit> {
    throw new Error(mocks.IntentionalError);
  }
}

describe("FileDraftTarGz", () => {
  test("create", async () => {
    const archive = new FileDraftTarGz(bundle, [
      new Draft(first, extension, content),
      new Draft(second, extension, content),
    ]);

    const body = await archive.create();
    const bytes = new Uint8Array(await new Response(body).arrayBuffer());
    const signature = bytes.subarray(0, 3).toHex();
    const tar = new TextDecoder().decode(Bun.gunzipSync(bytes));

    expect(signature).toEqual(identifier);
    expect(tar).toContain("first.csv");
    expect(tar).toContain("second.csv");
    expect(tar).toContain(content);
    expect(Bun.gunzipSync(bytes).length).toEqual(10240);
  });

  test("create - empty", async () => {
    const archive = new FileDraftTarGz(bundle, []);

    const body = await archive.create();
    const bytes = new Uint8Array(await new Response(body).arrayBuffer());

    expect(bytes.subarray(0, 3).toHex()).toEqual(identifier);
    expect(bytes.length).toEqual(45);
  });

  test("create - failure", async () => {
    const archive = new FileDraftTarGz(bundle, [new FailingDraft()]);

    expect(async () => archive.create()).toThrow(mocks.IntentionalError);
  });

  test("getHeaders", async () => {
    const archive = new FileDraftTarGz(bundle, [new Draft(first, extension, content)]);

    expect(archive.getHeaders().toJSON()).toEqual({
      "content-type": "application/gzip",
      "content-disposition": 'attachment; filename="bundle.tar"',
    });
  });

  test("toResponse", async () => {
    const archive = new FileDraftTarGz(bundle, [
      new Draft(first, extension, content),
      new Draft(second, extension, content),
    ]);

    const response = await archive.toResponse();

    expect(response.status).toEqual(200);
    expect(response.headers.get("content-type")).toEqual("application/gzip");
    expect(response.headers.get("content-disposition")).toEqual('attachment; filename="bundle.tar"');

    const bytes = new Uint8Array(await response.arrayBuffer());
    const tar = new TextDecoder().decode(Bun.gunzipSync(bytes));

    expect(bytes.subarray(0, 3).toHex()).toEqual(identifier);
    expect(tar).toContain("first.csv");
    expect(tar).toContain("second.csv");
  });

  test("toResponse - endpoint", async () => {
    const app = new Hono().get("/export", async () => {
      const archive = new FileDraftTarGz(bundle, [
        new Draft(v.parse(tools.Basename, "first"), extension, "a"),
        new Draft(v.parse(tools.Basename, "second"), extension, "b"),
      ]);

      return archive.toResponse();
    });

    const response = await app.request("/export");

    expect(response.status).toEqual(200);
    expect(response.headers.get("content-type")).toEqual("application/gzip");
    expect(response.headers.get("content-disposition")).toEqual('attachment; filename="bundle.tar"');

    const bytes = new Uint8Array(await response.arrayBuffer());
    const tar = new TextDecoder().decode(Bun.gunzipSync(bytes));

    expect(bytes.subarray(0, 3).toHex()).toEqual(identifier);
    expect(tar).toContain("first.csv");
    expect(tar).toContain("second.csv");
  });
});
