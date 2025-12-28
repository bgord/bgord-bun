import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import * as mocks from "./mocks";

const adapter = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("ClockFixedAdapter", () => {
  test("now", () => {
    expect(adapter.now().equals(mocks.TIME_ZERO)).toEqual(true);
  });
});
