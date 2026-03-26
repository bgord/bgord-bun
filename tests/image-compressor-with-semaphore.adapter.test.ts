import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { ImageCompressorStrategy } from "../src/image-compressor.port";
import { ImageCompressorNoopAdapter } from "../src/image-compressor-noop.adapter";
import { ImageCompressorWithSemaphoreAdapter } from "../src/image-compressor-with-semaphore.adapter";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
const recipe: ImageCompressorStrategy = { strategy: "in_place", input };
const limit = tools.Int.positive(1);

const semaphore = new Semaphore({ limit });
const inner = new ImageCompressorNoopAdapter();
const adapter = new ImageCompressorWithSemaphoreAdapter({ inner, semaphore });

describe("ImageCompressorWithSemaphoreAdapter", () => {
  test("compress - success", async () => {
    expect(await adapter.compress(recipe)).toEqual(input);
  });

  test("compress - error", async () => {
    using _ = spyOn(inner, "compress").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.compress(recipe)).toThrow(mocks.IntentionalError);
  });

  test("compress - uses semaphore", async () => {
    using semaphoreRun = spyOn(semaphore, "run");

    await adapter.compress(recipe);

    expect(semaphoreRun).toHaveBeenCalledTimes(1);
  });
});
