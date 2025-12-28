import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { ClockOffsetAdapter } from "../src/clock-offset.adapter";
import * as mocks from "./mocks";

const offset = tools.Duration.Hours(1);
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock };
const provider = new ClockOffsetAdapter(offset, deps);

describe("ClockOffsetAdapter", () => {
  test("now", () => {
    expect(provider.now().equals(mocks.TIME_ZERO.add(offset))).toEqual(true);
  });
});
