import { describe, expect, jest, spyOn, test } from "bun:test";
import { RedactorCompositeStrategy } from "../src/redactor-composite.strategy";
import { RedactorErrorCauseDepthLimitStrategy } from "../src/redactor-error-cause-depth-limit.strategy";
import { RedactorErrorStackHideStrategy } from "../src/redactor-error-stack-hide.strategy";
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

  test("handle - redactor", () => {
    const consoleError = spyOn(console, "error").mockImplementation(jest.fn());
    const redactor = new RedactorCompositeStrategy([
      new RedactorErrorStackHideStrategy(),
      new RedactorErrorCauseDepthLimitStrategy(1),
    ]);
    const diagnostics = new WoodchopperDiagnosticsConsoleError(redactor);

    const IntentionalCause = "intentional.cause";
    const error = new Error(mocks.IntentionalError);
    const first = new Error(IntentionalCause);
    const second = new Error(IntentionalCause);
    error.cause = first;
    first.cause = second;

    diagnostics.handle({ kind: "sink", error });

    expect(consoleError).toHaveBeenCalledWith({
      kind: "sink",
      error: {
        message: mocks.IntentionalError,
        name: "Error",
        cause: { name: "Error", cause: undefined, message: IntentionalCause },
      },
    });
  });
});
