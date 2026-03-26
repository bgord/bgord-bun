import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { ImageBlurStrategy } from "../src/image-blur.port";
import { ImageBlurNoopAdapter } from "../src/image-blur-noop.adapter";
import { ImageBlurWithSemaphoreAdapter } from "../src/image-blur-with-semaphore.adapter";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
const recipe: ImageBlurStrategy = { strategy: "in_place", input };
const limit = tools.Int.positive(1);

const semaphore = new Semaphore({ limit });
const inner = new ImageBlurNoopAdapter();
const adapter = new ImageBlurWithSemaphoreAdapter({ inner, semaphore });

describe("ImageBlurWithSemaphoreAdapter", () => {
  test("blur - success", async () => {
    expect(await adapter.blur(recipe)).toEqual(input);
  });

  test("blur - error", async () => {
    using _ = spyOn(inner, "blur").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.blur(recipe)).toThrow(mocks.IntentionalError);
  });

  test("blur - uses semaphore", async () => {
    using semaphoreRun = spyOn(semaphore, "run");

    await adapter.blur(recipe);

    expect(semaphoreRun).toHaveBeenCalledTimes(1);
  });
});
