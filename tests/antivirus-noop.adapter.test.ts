import { describe, expect, test } from "bun:test";
import { AntivirusNoopAdapter } from "../src/antivirus-noop.adapter";

const adapter = new AntivirusNoopAdapter();

describe("AntivirusNoopAdapter", () => {
  test("scan - clean - true", async () => {
    expect(await adapter.scan(new Uint8Array([1, 2, 3]))).toEqual({ clean: true });
  });
});
