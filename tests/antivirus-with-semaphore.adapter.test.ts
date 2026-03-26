import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AntivirusNoopAdapter } from "../src/antivirus-noop.adapter";
import { AntivirusWithSemaphoreAdapter } from "../src/antivirus-with-semaphore.adapter";
import { Semaphore } from "../src/semaphore.service";
import * as mocks from "./mocks";

const bytes = new Uint8Array([1, 2, 3]);
const limit = tools.Int.positive(1);

const semaphore = new Semaphore({ limit });
const inner = new AntivirusNoopAdapter();
const adapter = new AntivirusWithSemaphoreAdapter({ inner, semaphore });

describe("AntivirusWithSemaphoreAdapter", () => {
  test("scan - success", async () => {
    expect(await adapter.scan(bytes)).toEqual({ clean: true });
  });

  test("scan - error", async () => {
    using _ = spyOn(inner, "scan").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => adapter.scan(bytes)).toThrow(mocks.IntentionalError);
  });

  test("scan - uses semaphore", async () => {
    using semaphoreRun = spyOn(semaphore, "run");

    await adapter.scan(bytes);

    expect(semaphoreRun).toHaveBeenCalledTimes(1);
  });
});
