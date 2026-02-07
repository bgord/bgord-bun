import { ErrorNormalizer } from "./error-normalizer.service";
import type {
  WoodchopperDiagnosticsStrategy,
  WoodchopperDiagnosticType,
} from "./woodchopper-diagnostics.strategy";

export class WoodchopperDiagnosticsCollecting implements WoodchopperDiagnosticsStrategy {
  readonly entries: Array<WoodchopperDiagnosticType> = [];

  handle(diagnostic: WoodchopperDiagnosticType): void {
    this.entries.push({ ...diagnostic, error: ErrorNormalizer.normalize(diagnostic.error) });
  }
}
