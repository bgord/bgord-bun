import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ImageInfoNoopAdapter } from "../src/image-info-noop.adapter";
import { ImageInfoWithSemaphoreAdapter } from "../src/image-info-with-semaphore.adapter";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
const limit = tools.Int.positive(1);

const semaphore = new Semaphore({ limit });
const inner = new ImageInfoNoopAdapter(tools.Mimes.jpg.mime);
const adapter = new ImageInfoWithSemaphoreAdapter({ inner, semaphore });

describe("ImageInfoWithSemaphoreAdapter", () => {
  test("inspect - success", async () => {
    expect(async () => adapter.inspect(input)).not.toThrow();
  });

  test("inspect - error", async () => {
    using _ = spyOn(inner, "inspect").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.inspect(input)).toThrow(mocks.IntentionalError);
  });

  test("inspect - uses semaphore", async () => {
    using semaphoreRun = spyOn(semaphore, "run");

    await adapter.inspect(input);

    expect(semaphoreRun).toHaveBeenCalledTimes(1);
  });
});
