import { formatError } from "./format-error.service";
import type {
  WoodchopperDiagnosticsStrategy,
  WoodchopperDiagnosticType,
} from "./woodchopper-diagnostics.strategy";

export class WoodchopperDiagnosticsNoop implements WoodchopperDiagnosticsStrategy {
  readonly entries: WoodchopperDiagnosticType[] = [];

  handle(diagnostic: WoodchopperDiagnosticType) {
    this.entries.push({ ...diagnostic, error: formatError(diagnostic.error) });
  }
}
