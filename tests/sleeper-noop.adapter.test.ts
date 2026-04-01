import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";

const provider = new SleeperNoopAdapter();

describe("SleeperNoopAdapter", () => {
  test("wait", async () => {
    expect(async () => provider.wait(tools.Duration.ZERO)).not.toThrow();
  });
});
