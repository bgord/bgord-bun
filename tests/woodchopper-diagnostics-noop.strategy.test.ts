import { describe, expect, test } from "bun:test";
import { WoodchopperDiagnosticsNoop } from "../src/woodchopper-diagnostics-noop.strategy";
import * as mocks from "./mocks";

describe("WoodchopperDiagnosticsNoop", () => {
  test("handle", () => {
    const diagnostics = new WoodchopperDiagnosticsNoop();

    diagnostics.handle({ kind: "sink", error: new Error(mocks.IntentionalError) });

    expect(diagnostics.entries).toMatchObject([{ kind: "sink", error: { message: mocks.IntentionalError } }]);
  });
});
