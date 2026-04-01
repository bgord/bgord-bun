import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import * as mocks from "./mocks";

const adapter = new ClockFixedAdapter(mocks.TIME_ZERO);
const offset = tools.Duration.Seconds(5);

describe("ClockFixedAdapter", () => {
  test("now", () => {
    expect(adapter.now().equals(mocks.TIME_ZERO)).toEqual(true);
  });

  test("advanceBy", () => {
    const adapter = new ClockFixedAdapter(mocks.TIME_ZERO);
    adapter.advanceBy(offset);

    expect(adapter.now()).toEqual(mocks.TIME_ZERO.add(offset));
  });
});
