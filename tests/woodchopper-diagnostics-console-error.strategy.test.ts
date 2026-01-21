import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
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

    expect(consoleError).toHaveBeenCalledWith({ kind: "sink", error: mocks.IntentionalErrorNormalized });
  });

  test("handle - redactor", () => {
    const consoleError = spyOn(console, "error").mockImplementation(jest.fn());
    const redactor = new RedactorCompositeStrategy([
      new RedactorErrorStackHideStrategy(),
      new RedactorErrorCauseDepthLimitStrategy(tools.IntegerNonNegative.parse(1)),
    ]);
    const diagnostics = new WoodchopperDiagnosticsConsoleError(redactor);

    const error = new Error(mocks.IntentionalError);
    const first = new Error(mocks.IntentionalCause);
    const second = new Error(mocks.IntentionalCause);
    error.cause = first;
    first.cause = second;

    diagnostics.handle({ kind: "sink", error });

    expect(consoleError).toHaveBeenCalledWith({
      kind: "sink",
      error: {
        ...mocks.IntentionalErrorNormalized,
        stack: undefined,
        cause: { name: "Error", message: mocks.IntentionalCause },
      },
    });
  });
});
