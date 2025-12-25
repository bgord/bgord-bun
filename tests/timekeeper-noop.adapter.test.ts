import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { TimekeeperNoopAdapter } from "../src/timekeeper-noop.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock };

const adapter = new TimekeeperNoopAdapter(deps);

describe("TimekeeperNoopAdapter", () => {
  test("happy path", async () => {
    expect(await adapter.get()).toEqual(Clock.now());
  });
});
