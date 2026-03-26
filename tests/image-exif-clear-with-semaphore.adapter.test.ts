import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { ImageExifClearStrategy } from "../src/image-exif-clear.port";
import { ImageExifClearNoopAdapter } from "../src/image-exif-clear-noop.adapter";
import { ImageExifClearWithSemaphoreAdapter } from "../src/image-exif-clear-with-semaphore.adapter";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
const recipe: ImageExifClearStrategy = { strategy: "in_place", input };
const limit = tools.Int.positive(1);

const semaphore = new Semaphore({ limit });
const inner = new ImageExifClearNoopAdapter();
const adapter = new ImageExifClearWithSemaphoreAdapter({ inner, semaphore });

describe("ImageExifClearWithSemaphoreAdapter", () => {
  test("clear - success", async () => {
    expect(await adapter.clear(recipe)).toEqual(input);
  });

  test("clear - error", async () => {
    using _ = spyOn(inner, "clear").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.clear(recipe)).toThrow(mocks.IntentionalError);
  });

  test("clear - uses semaphore", async () => {
    using semaphoreRun = spyOn(semaphore, "run");

    await adapter.clear(recipe);

    expect(semaphoreRun).toHaveBeenCalledTimes(1);
  });
});
