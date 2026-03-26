import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { ImageFormatterStrategy } from "../src/image-formatter.port";
import { ImageFormatterNoopAdapter } from "../src/image-formatter-noop.adapter";
import { ImageFormatterWithSemaphoreAdapter } from "../src/image-formatter-with-semaphore.adapter";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/in/img.png");
const output = tools.FilePathAbsolute.fromString("/var/out/img.webp");
const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };
const limit = tools.Int.positive(1);

const semaphore = new Semaphore({ limit });
const inner = new ImageFormatterNoopAdapter();
const adapter = new ImageFormatterWithSemaphoreAdapter({ inner, semaphore });

describe("ImageFormatterWithSemaphoreAdapter", () => {
  test("format - success", async () => {
    expect(await adapter.format(recipe)).toEqual(output);
  });

  test("format - error", async () => {
    using _ = spyOn(inner, "format").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.format(recipe)).toThrow(mocks.IntentionalError);
  });

  test("format - uses semaphore", async () => {
    using semaphoreRun = spyOn(semaphore, "run");

    await adapter.format(recipe);

    expect(semaphoreRun).toHaveBeenCalledTimes(1);
  });
});
