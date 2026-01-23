import { describe, expect, test } from "bun:test";
import { WoodchopperDiagnosticsNoop } from "../src/woodchopper-diagnostics-noop.strategy";
import * as mocks from "./mocks";

describe("WoodchopperDiagnosticsNoop", () => {
  test("handle", () => {
    const diagnostics = new WoodchopperDiagnosticsNoop();

    expect(() =>
      diagnostics.handle({ kind: "sink", error: new Error(mocks.IntentionalError) }),
    ).not.toThrow();
  });
});
