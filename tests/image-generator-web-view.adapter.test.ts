import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ImageGeneratorWebViewAdapter } from "../src/image-generator-web-view.adapter";
import * as mocks from "./mocks";

const width = v.parse(tools.ImageWidth, 800);
const height = v.parse(tools.ImageHeight, 600);
const extension = v.parse(tools.Extension, "png");
const filename = tools.Filename.fromParts(mocks.TIME_ZERO.ms.toString(), extension);

const template = "<html></html>";
const image = Object.assign(Buffer.from([]), { name: "screenshot.png", size: 0 });

const adapter = new ImageGeneratorWebViewAdapter();

describe("ImageGeneratorWebViewAdapter", () => {
  test("happy path", async () => {
    using navigate = spyOn(Bun.WebView.prototype, "navigate").mockImplementation(mocks.asyncNoop);
    using screenshot = spyOn(Bun.WebView.prototype, "screenshot").mockResolvedValue(image);

    const result = await adapter.generate(template, filename, width, height);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(navigate).toHaveBeenCalledWith(`data:text/html;charset=utf-8,${encodeURIComponent(template)}`);
    expect(screenshot).toHaveBeenCalledWith({ encoding: "buffer", format: extension });
  });

  test("failure - navigate", async () => {
    using navigate = spyOn(Bun.WebView.prototype, "navigate").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );
    using screenshot = spyOn(Bun.WebView.prototype, "screenshot").mockResolvedValue(image);

    expect(async () => adapter.generate(template, filename, width, height)).toThrow(mocks.IntentionalError);

    expect(navigate).toHaveBeenCalledWith(`data:text/html;charset=utf-8,${encodeURIComponent(template)}`);
    expect(screenshot).not.toHaveBeenCalled();
  });

  test("failure - screenshot", async () => {
    using navigate = spyOn(Bun.WebView.prototype, "navigate").mockImplementation(mocks.asyncNoop);
    using screenshot = spyOn(Bun.WebView.prototype, "screenshot").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );

    expect(async () => adapter.generate(template, filename, width, height)).toThrow(mocks.IntentionalError);

    expect(navigate).toHaveBeenCalledWith(`data:text/html;charset=utf-8,${encodeURIComponent(template)}`);
    expect(screenshot).toHaveBeenCalledWith({ encoding: "buffer", format: extension });
  });
});
