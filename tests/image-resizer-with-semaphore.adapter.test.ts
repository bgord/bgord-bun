import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ImageResizerStrategy } from "../src/image-resizer.port";
import { ImageResizerNoopAdapter } from "../src/image-resizer-noop.adapter";
import { ImageResizerWithSemaphoreAdapter } from "../src/image-resizer-with-semaphore.adapter";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
const recipe: ImageResizerStrategy = { strategy: "in_place", input, maxSide: v.parse(tools.ImageWidth, 256) };
const limit = tools.Int.positive(1);

const semaphore = new Semaphore({ limit });
const inner = new ImageResizerNoopAdapter();
const adapter = new ImageResizerWithSemaphoreAdapter({ inner, semaphore });

describe("ImageResizerWithSemaphoreAdapter", () => {
  test("resize - success", async () => {
    expect(await adapter.resize(recipe)).toEqual(input);
  });

  test("resize - error", async () => {
    using _ = spyOn(inner, "resize").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.resize(recipe)).toThrow(mocks.IntentionalError);
  });

  test("resize - uses semaphore", async () => {
    using semaphoreRun = spyOn(semaphore, "run");

    await adapter.resize(recipe);

    expect(semaphoreRun).toHaveBeenCalledTimes(1);
  });
});
