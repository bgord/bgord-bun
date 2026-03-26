import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { ImageGrayscaleStrategy } from "../src/image-grayscale.port";
import { ImageGrayscaleNoopAdapter } from "../src/image-grayscale-noop.adapter";
import { ImageGrayscaleWithSemaphoreAdapter } from "../src/image-grayscale-with-semaphore.adapter";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
const recipe: ImageGrayscaleStrategy = { strategy: "in_place", input };
const limit = tools.Int.positive(1);

const semaphore = new Semaphore({ limit });
const inner = new ImageGrayscaleNoopAdapter();
const adapter = new ImageGrayscaleWithSemaphoreAdapter({ inner, semaphore });

describe("ImageGrayscaleWithSemaphoreAdapter", () => {
  test("grayscale - success", async () => {
    expect(await adapter.grayscale(recipe)).toEqual(input);
  });

  test("grayscale - error", async () => {
    using _ = spyOn(inner, "grayscale").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.grayscale(recipe)).toThrow(mocks.IntentionalError);
  });

  test("grayscale - uses semaphore", async () => {
    using semaphoreRun = spyOn(semaphore, "run");

    await adapter.grayscale(recipe);

    expect(semaphoreRun).toHaveBeenCalledTimes(1);
  });
});
