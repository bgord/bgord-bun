import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileInspectionNoopAdapter } from "../src/file-inspection-noop.adapter";
import { ImageInfoSharpAdapter } from "../src/image-info-sharp.adapter";
import * as mocks from "./mocks";

const size = tools.Size.fromKb(1);
const instance = { metadata: async () => ({}), destroy: () => {} };
const input = tools.FilePathAbsolute.fromString("/var/uploads/avatar.jpeg");

const jpegMime = tools.Mime.fromString("image/jpeg");
const jpgExtension = tools.Extension.parse("jpg");
const jpegExtension = tools.Extension.parse("jpeg");

const FileInspection = new FileInspectionNoopAdapter({ exists: true, size });
const MimeRegistry = new tools.MimeRegistry([{ mime: jpegMime, extensions: [jpgExtension, jpegExtension] }]);
const deps = { MimeRegistry, FileInspection };

describe("ImageInfoSharpAdapter", () => {
  test("absolute path", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageInfoSharpAdapter, "import").mockResolvedValue({ default: () => instance });
    const metadata = spyOn(instance, "metadata").mockResolvedValue({
      width: 120,
      height: 80,
      format: "jpeg",
    });
    const destroy = spyOn(instance, "destroy");
    const adapter = await ImageInfoSharpAdapter.build(deps);

    const info = await adapter.inspect(input);

    expect(info.width).toEqual(tools.ImageWidth.parse(120));
    expect(info.height).toEqual(tools.ImageHeight.parse(80));
    expect(info.mime).toEqual(tools.Mimes.jpg.mime);
    expect(info.size).toEqual(size);
    expect(metadata).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("relative path", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageInfoSharpAdapter, "import").mockResolvedValue({ default: () => instance });
    const metadata = spyOn(instance, "metadata").mockResolvedValue({ width: 64, height: 64, format: "jpg" });
    const destroy = spyOn(instance, "destroy");
    const adapter = await ImageInfoSharpAdapter.build(deps);

    const info = await adapter.inspect(input);

    expect(info.width).toEqual(tools.ImageWidth.parse(64));
    expect(info.height).toEqual(tools.ImageHeight.parse(64));
    expect(info.mime).toEqual(tools.Mimes.jpg.mime);
    expect(info.size).toEqual(size);
    expect(metadata).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("error - extension empty", async () => {
    const FileInspection = new FileInspectionNoopAdapter({ exists: true, size });
    spyOn(FileInspection, "size").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = await ImageInfoSharpAdapter.build({ MimeRegistry, FileInspection });

    expect(async () => adapter.inspect(input)).toThrow(mocks.IntentionalError);
  });

  test("error - extension empty", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageInfoSharpAdapter, "import").mockResolvedValue({ default: () => instance });
    spyOn(instance, "metadata").mockResolvedValue({ width: 10, height: 10, format: "" });
    const destroy = spyOn(instance, "destroy");
    const adapter = await ImageInfoSharpAdapter.build(deps);

    expect(async () => adapter.inspect(input)).toThrow(tools.ExtensionError.Empty);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("error - width", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageInfoSharpAdapter, "import").mockResolvedValue({ default: () => instance });
    spyOn(instance, "metadata").mockResolvedValue({ width: undefined, height: 10, format: "jpeg" });
    const destroy = spyOn(instance, "destroy");
    const adapter = await ImageInfoSharpAdapter.build(deps);

    expect(async () => adapter.inspect(input)).toThrow(tools.ImageWidthError.Type);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("error - mime not found", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageInfoSharpAdapter, "import").mockResolvedValue({ default: () => instance });
    spyOn(instance, "metadata").mockResolvedValue({ width: 10, height: 10, format: "png" });
    const destroy = spyOn(instance, "destroy");
    const adapter = await ImageInfoSharpAdapter.build(deps);

    expect(async () => adapter.inspect(input)).toThrow(tools.MimeRegistryError.MimeNotFound);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("missing dependency", async () => {
    spyOn(ImageInfoSharpAdapter, "import").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => ImageInfoSharpAdapter.build(deps)).toThrow(
      "image.info.sharp.adapter.error.missing.dependency",
    );
  });
});
