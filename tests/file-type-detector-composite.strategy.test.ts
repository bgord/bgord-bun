import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileTypeDetectorCompositeStrategy } from "../src/file-type-detector-composite.strategy";
import { FileTypeDetectorFixedStrategy } from "../src/file-type-detector-fixed.strategy";

const file = new File(["sample"], "sample");

describe("FileTypeDetectorCompositeStrategy", () => {
  test("first strategy matches", async () => {
    const detector = new FileTypeDetectorCompositeStrategy([
      new FileTypeDetectorFixedStrategy(tools.Mimes.png.mime),
      new FileTypeDetectorFixedStrategy(tools.Mimes.jpg.mime),
    ]);

    expect(await detector.detect(file)).toEqual(tools.Mimes.png.mime);
  });

  test("later strategy matches", async () => {
    const detector = new FileTypeDetectorCompositeStrategy([
      new FileTypeDetectorFixedStrategy(null),
      new FileTypeDetectorFixedStrategy(tools.Mimes.jpg.mime),
    ]);

    expect(await detector.detect(file)).toEqual(tools.Mimes.jpg.mime);
  });

  test("no strategy matches", async () => {
    const detector = new FileTypeDetectorCompositeStrategy([
      new FileTypeDetectorFixedStrategy(null),
      new FileTypeDetectorFixedStrategy(null),
    ]);

    expect(await detector.detect(file)).toEqual(null);
  });

  test("stops at the first match", async () => {
    const second = new FileTypeDetectorFixedStrategy(tools.Mimes.jpg.mime);
    const detector = new FileTypeDetectorCompositeStrategy([
      new FileTypeDetectorFixedStrategy(tools.Mimes.png.mime),
      second,
    ]);
    using detect = spyOn(second, "detect");

    await detector.detect(file);

    expect(detect).not.toHaveBeenCalled();
  });

  test("passes the file to the strategy", async () => {
    const strategy = new FileTypeDetectorFixedStrategy(tools.Mimes.png.mime);
    const detector = new FileTypeDetectorCompositeStrategy([strategy]);
    using detect = spyOn(strategy, "detect");

    await detector.detect(file);

    expect(detect).toHaveBeenCalledWith(file);
  });

  test("no strategies", () => {
    expect(() => new FileTypeDetectorCompositeStrategy([])).toThrow(
      "file.type.detector.composite.strategies.min",
    );
  });
});
