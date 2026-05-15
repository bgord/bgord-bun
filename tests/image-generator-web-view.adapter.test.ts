import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ImageGeneratorWebViewAdapter } from "../src/image-generator-web-view.adapter";
import * as mocks from "./mocks";

const template = "<html></html>";
const filename = tools.Filename.fromParts(mocks.TIME_ZERO.ms.toString(), "png");
const width = v.parse(tools.ImageWidth, 800);
const height = v.parse(tools.ImageHeight, 600);

const config = { template, filename, width, height };
const adapter = new ImageGeneratorWebViewAdapter();

const image = Object.assign(Buffer.from([]), { name: "screenshot.png", size: 0 });

describe("ImageGeneratorWebViewAdapter", () => {
  test("happy path", async () => {
    using navigate = spyOn(Bun.WebView.prototype, "navigate").mockImplementation(mocks.asyncNoop);
    using screenshot = spyOn(Bun.WebView.prototype, "screenshot").mockResolvedValue(image);

    const result = await adapter.generate(config);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(navigate).toHaveBeenCalledWith(`data:text/html;charset=utf-8,${encodeURIComponent(template)}`);
    expect(screenshot).toHaveBeenCalledWith({ encoding: "buffer", format: filename.getExtension() });
  });

  test("failure - navigate", async () => {
    using navigate = spyOn(Bun.WebView.prototype, "navigate").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );
    using screenshot = spyOn(Bun.WebView.prototype, "screenshot").mockResolvedValue(image);

    expect(async () => adapter.generate(config)).toThrow(mocks.IntentionalError);

    expect(navigate).toHaveBeenCalledWith(`data:text/html;charset=utf-8,${encodeURIComponent(template)}`);
    expect(screenshot).not.toHaveBeenCalled();
  });

  test("failure - screenshot", async () => {
    using navigate = spyOn(Bun.WebView.prototype, "navigate").mockImplementation(mocks.asyncNoop);
    using screenshot = spyOn(Bun.WebView.prototype, "screenshot").mockImplementation(
      mocks.throwIntentionalErrorAsync,
    );

    expect(async () => adapter.generate(config)).toThrow(mocks.IntentionalError);

    expect(navigate).toHaveBeenCalledWith(`data:text/html;charset=utf-8,${encodeURIComponent(template)}`);
    expect(screenshot).toHaveBeenCalledWith({ encoding: "buffer", format: filename.getExtension() });
  });
});
