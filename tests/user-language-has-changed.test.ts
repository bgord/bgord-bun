import { describe, expect, test } from "bun:test";
import { UserLanguageHasChanged } from "../src/modules/preferences/invariants";

describe("UserLanguageHasChanged", () => {
  test("passes - no language", () => {
    expect(UserLanguageHasChanged.passes({ current: null, candidate: "en" })).toEqual(true);
    expect(UserLanguageHasChanged.passes({ current: undefined, candidate: "en" })).toEqual(true);
  });

  test("passes - not equal", () => {
    expect(UserLanguageHasChanged.passes({ current: "pl", candidate: "en" })).toEqual(true);
  });

  test("fails - equal", () => {
    expect(UserLanguageHasChanged.fails({ current: "en", candidate: "en" })).toEqual(true);
  });
});
