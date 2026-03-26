import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { ImageAlphaStrategy } from "../src/image-alpha.port";
import { ImageAlphaNoopAdapter } from "../src/image-alpha-noop.adapter";
import { ImageAlphaWithSemaphoreAdapter } from "../src/image-alpha-with-semaphore.adapter";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#F8FAFC" };
const limit = tools.Int.positive(1);

const semaphore = new Semaphore({ limit });
const inner = new ImageAlphaNoopAdapter();
const adapter = new ImageAlphaWithSemaphoreAdapter({ inner, semaphore });

describe("ImageAlphaWithSemaphoreAdapter", () => {
  test("flatten - success", async () => {
    expect(await adapter.flatten(recipe)).toEqual(input);
  });

  test("flatten - error", async () => {
    using _ = spyOn(inner, "flatten").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.flatten(recipe)).toThrow(mocks.IntentionalError);
  });

  test("flatten - uses semaphore", async () => {
    using semaphoreRun = spyOn(semaphore, "run");

    await adapter.flatten(recipe);

    expect(semaphoreRun).toHaveBeenCalledTimes(1);
  });
});
