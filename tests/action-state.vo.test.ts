import { describe, expect, test } from "bun:test";
import { ActionState } from "../src/action-state.vo";

const actionAvailable: ActionState = { available: true, enabled: true, hints: [] };
const actionUnavailable: ActionState = { available: false, enabled: false, hints: [] };

describe("ActionState", () => {
  test("of - available", () => {
    expect(ActionState.of(true)).toEqual(actionAvailable);
  });

  test("of - unavailable", () => {
    expect(ActionState.of(false)).toEqual(actionUnavailable);
  });

  test("of - available - passing blockers", () => {
    expect(ActionState.of(true, [{ passes: true, hint: "first" }])).toEqual(actionAvailable);
  });

  test("of - available - failing blockers", () => {
    expect(
      ActionState.of(true, [
        { passes: false, hint: "first" },
        { passes: true, hint: "second" },
        { passes: false, hint: "third" },
      ]),
    ).toEqual({ available: true, enabled: false, hints: ["first", "third"] });
  });

  test("of - unavailable - failing blockers", () => {
    expect(ActionState.of(false, [{ passes: false, hint: "first" }])).toEqual(actionUnavailable);
  });
});
