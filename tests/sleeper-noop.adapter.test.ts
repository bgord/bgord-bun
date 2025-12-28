import { describe, expect, test } from "bun:test";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";

const provider = new SleeperNoopAdapter();

describe("SleeperNoopAdapter", () => {
  test("wait", async () => {
    expect(async () => provider.wait()).not.toThrow();
  });
});
