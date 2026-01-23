import { describe, expect, test } from "bun:test";
import { WoodchopperDiagnosticsCollecting } from "../src/woodchopper-diagnostics-collecting.strategy";
import * as mocks from "./mocks";

describe("WoodchopperDiagnosticsCollecting", () => {
  test("handle", () => {
    const diagnostics = new WoodchopperDiagnosticsCollecting();

    diagnostics.handle({ kind: "sink", error: new Error(mocks.IntentionalError) });

    expect(diagnostics.entries).toMatchObject([{ kind: "sink", error: { message: mocks.IntentionalError } }]);
  });
});
