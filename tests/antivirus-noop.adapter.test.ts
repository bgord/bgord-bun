import { describe, expect, test } from "bun:test";
import { AntivirusNoopAdapter } from "../src/antivirus-noop.adapter";

const adapter = new AntivirusNoopAdapter();

describe("AntivirusNoopAdapter", () => {
  test("clean - exit code 0", async () => {
    expect(await adapter.scanBytes(new Uint8Array([1, 2, 3]))).toEqual({ clean: true });
  });
});
