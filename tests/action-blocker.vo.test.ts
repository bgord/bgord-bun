import { describe, expect, test } from "bun:test";
import { ActionBlocker } from "../src/action-blocker.vo";
import * as mocks from "./mocks";

const invariant = new mocks.SampleInvariant();

describe("ActionBlocker", () => {
  test("from - passes", () => {
    const blocker = ActionBlocker.from(invariant, { threshold: 0 });

    expect(blocker).toEqual({ passes: true, hint: "SampleInvariant failed" });
  });

  test("from - fails", () => {
    const blocker = ActionBlocker.from(invariant, { threshold: 11 });

    expect(blocker).toEqual({ passes: false, hint: "SampleInvariant failed" });
  });
});
