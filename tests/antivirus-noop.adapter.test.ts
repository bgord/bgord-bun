import { describe, expect, test } from "bun:test";
import { AntivirusNoopAdapter } from "../src/antivirus-noop.adapter";
import * as mocks from "./mocks";

const adapter = new AntivirusNoopAdapter();

describe("AntivirusNoopAdapter", () => {
  test("scan - clean - true", async () => {
    expect(await adapter.scan(mocks.cleanFile)).toEqual({ clean: true });
  });
});
