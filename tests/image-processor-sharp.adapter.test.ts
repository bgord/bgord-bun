import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import type { ImageProcessorStrategy } from "../src/image-processor.port";
import { ImageProcessorSharpAdapter } from "../src/image-processor-sharp.adapter";

describe("ImageProcessorSharpAdapter.process", () => {
  test("in_place: rotate → flatten → resize → encode", async () => {
    const pipeline = {
      rotate: () => pipeline,
      flatten: (_: any) => pipeline,
      resize: (_: any) => pipeline,
      toFormat: (_fmt: any, _opts?: any) => pipeline,
      toFile: async (_: string) => {},
      destroy: () => {},
    };
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const flattenSpy = spyOn(pipeline, "flatten").mockReturnValue(pipeline);
    const resizeSpy = spyOn(pipeline, "resize").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);
    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue(undefined);

    const adapter = new ImageProcessorSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/in/photo.png");
    const recipe: ImageProcessorStrategy = {
      strategy: "in_place",
      input,
      maxSide: 256,
      to: tools.ExtensionSchema.parse("webp"),
      quality: 72,
      background: "#FFFFFF",
    };

    const finalVo = await adapter.process(recipe);

    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(flattenSpy).toHaveBeenCalledWith({ background: "#FFFFFF" });
    expect(resizeSpy).toHaveBeenCalledTimes(1);
    const [resizeOpts] = resizeSpy.mock.calls[0] as any[];
    expect(resizeOpts).toMatchObject({ width: 256, height: 256, fit: "inside", withoutEnlargement: true });

    const [fmt, opts] = toFormatSpy.mock.calls[0] as any[];
    expect(fmt).toBe("webp");
    expect(opts).toMatchObject({ quality: 72 });

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/var/in/photo-processed.webp");
    expect(renameSpy).toHaveBeenCalledWith("/var/in/photo-processed.webp", "/var/in/photo.webp");

    expect(unlinkSpy).toHaveBeenCalledWith("/var/in/photo.png");

    expect(finalVo.get()).toBe("/var/in/photo.webp");

    expect(sharpSpy).toHaveBeenCalledWith("/var/in/photo.png");
    expect(destroySpy).toHaveBeenCalledTimes(1);

    sharpSpy.mockRestore();
    renameSpy.mockRestore();
    unlinkSpy.mockRestore();
  });

  test("output_path: rotate (no flatten), resize, encoder from output", async () => {
    const pipeline = {
      rotate: () => pipeline,
      flatten: (_: any) => pipeline,
      resize: (_: any) => pipeline,
      toFormat: (_fmt: any, _opts?: any) => pipeline,
      toFile: async (_: string) => {},
      destroy: () => {},
    };
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const flattenSpy = spyOn(pipeline, "flatten").mockReturnValue(pipeline);
    const resizeSpy = spyOn(pipeline, "resize").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);
    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue(undefined);

    const adapter = new ImageProcessorSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.jpg");
    const recipe: ImageProcessorStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide: 512,
      to: tools.ExtensionSchema.parse("jpg"),
    };

    const finalVo = await adapter.process(recipe);

    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(flattenSpy).not.toHaveBeenCalled();

    const [resizeOpts] = resizeSpy.mock.calls[0] as any[];
    expect(resizeOpts).toMatchObject({ width: 512, height: 512, fit: "inside", withoutEnlargement: true });

    const [fmt, opts] = toFormatSpy.mock.calls[0] as any[];
    expect(fmt).toBe("jpeg");
    expect(opts).toMatchObject({ quality: 85 });

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/out/dest-processed.jpg");
    expect(renameSpy).toHaveBeenCalledWith("/out/dest-processed.jpg", "/out/dest.jpg");

    expect(unlinkSpy).not.toHaveBeenCalled();

    expect(finalVo).toBe(output);

    expect(sharpSpy).toHaveBeenCalledWith("/in/source.png");
    expect(destroySpy).toHaveBeenCalledTimes(1);

    sharpSpy.mockRestore();
    renameSpy.mockRestore();
    unlinkSpy.mockRestore();
  });
});
