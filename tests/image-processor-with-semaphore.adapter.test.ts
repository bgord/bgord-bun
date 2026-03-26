import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ImageProcessorStrategy } from "../src/image-processor.port";
import { ImageProcessorNoopAdapter } from "../src/image-processor-noop.adapter";
import { ImageProcessorWithSemaphoreAdapter } from "../src/image-processor-with-semaphore.adapter";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/in/source.png");
const output = tools.FilePathAbsolute.fromString("/var/out/dest.webp");
const recipe: ImageProcessorStrategy = {
  strategy: "output_path",
  input,
  output,
  maxSide: v.parse(tools.ImageWidth, 256),
  to: v.parse(tools.Extension, "webp"),
};
const limit = tools.Int.positive(1);

const semaphore = new Semaphore({ limit });
const inner = new ImageProcessorNoopAdapter();
const adapter = new ImageProcessorWithSemaphoreAdapter({ inner, semaphore });

describe("ImageProcessorWithSemaphoreAdapter", () => {
  test("process - success", async () => {
    expect(await adapter.process(recipe)).toEqual(output);
  });

  test("process - error", async () => {
    using _ = spyOn(inner, "process").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.process(recipe)).toThrow(mocks.IntentionalError);
  });

  test("process - uses semaphore", async () => {
    using semaphoreRun = spyOn(semaphore, "run");

    await adapter.process(recipe);

    expect(semaphoreRun).toHaveBeenCalledTimes(1);
  });
});
