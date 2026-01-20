import { describe, expect, jest, spyOn, test } from "bun:test";
import { WoodchopperDiagnosticsConsoleError } from "../src/woodchopper-diagnostics-console-error.strategy";
import * as mocks from "./mocks";

describe("WoodchopperDiagnosticsConsoleError", () => {
  test("handle", () => {
    const consoleError = spyOn(console, "error").mockImplementation(jest.fn());
    const diagnostics = new WoodchopperDiagnosticsConsoleError();

    diagnostics.handle({ kind: "sink", error: new Error(mocks.IntentionalError) });

    expect(consoleError).toHaveBeenCalledWith({
      kind: "sink",
      error: { message: mocks.IntentionalError, name: "Error", cause: undefined, stack: expect.any(String) },
    });
  });
});
