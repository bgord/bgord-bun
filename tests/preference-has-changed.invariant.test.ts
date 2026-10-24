import { describe, expect, test } from "bun:test";
import { PreferenceHasChanged } from "../src/modules/preferences/invariants";

describe("PreferenceHasChanged", () => {
  test("passes - no value", () => {
    expect(PreferenceHasChanged.passes({ current: null, candidate: "on" })).toEqual(true);
  });

  test("passes - not equal", () => {
    expect(PreferenceHasChanged.passes({ current: "off", candidate: "on" })).toEqual(true);
  });

  test("fails - equal", () => {
    expect(PreferenceHasChanged.passes({ current: "on", candidate: "on" })).toEqual(false);
  });

  test("message", () => {
    expect(PreferenceHasChanged.message).toEqual("preference.has.changed");
  });
});
