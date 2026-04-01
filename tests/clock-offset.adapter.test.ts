import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { ClockOffsetAdapter } from "../src/clock-offset.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock };

describe("ClockOffsetAdapter", () => {
  test("now - positive offset", () => {
    const offset = tools.Duration.Hours(1);
    const adapter = new ClockOffsetAdapter(offset, deps);

    expect(adapter.now().equals(mocks.TIME_ZERO.add(offset))).toEqual(true);
  });

  test("now - negative offset", () => {
    const offset = tools.Duration.Hours(-1);
    const adapter = new ClockOffsetAdapter(offset, deps);

    expect(adapter.now().equals(mocks.TIME_ZERO.add(offset))).toEqual(true);
  });
});
