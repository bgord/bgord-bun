import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { SleeperSystemAdapter } from "../src/sleeper-system.adapter";

const duration = tools.Duration.MIN;
const adapter = new SleeperSystemAdapter();

describe("SleeperSystemAdapter", () => {
  test("wait", async () => {
    using bunSleep = spyOn(Bun, "sleep").mockImplementation(jest.fn());

    await adapter.wait(duration);

    expect(bunSleep).toHaveBeenCalledWith(duration.ms);
  });
});
