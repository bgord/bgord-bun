import { formatError } from "./format-error.service";
import type {
  WoodchopperDiagnosticsStrategy,
  WoodchopperDiagnosticType,
} from "./woodchopper-diagnostics.strategy";

export class WoodchopperDiagnosticsConsoleError implements WoodchopperDiagnosticsStrategy {
  handle(diagnostic: WoodchopperDiagnosticType) {
    // biome-ignore lint: lint/suspicious/noConsole
    console.error({ ...diagnostic, error: formatError(diagnostic.error) });
  }
}
