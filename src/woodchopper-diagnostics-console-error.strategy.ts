import { ErrorNormalizer } from "./error-normalizer.service";
import type { RedactorStrategy } from "./redactor.strategy";
import type {
  WoodchopperDiagnosticsStrategy,
  WoodchopperDiagnosticType,
} from "./woodchopper-diagnostics.strategy";

export class WoodchopperDiagnosticsConsoleError implements WoodchopperDiagnosticsStrategy {
  constructor(private readonly redactor?: RedactorStrategy) {}

  handle(diagnostic: WoodchopperDiagnosticType) {
    const error = ErrorNormalizer.normalize(diagnostic.error);

    // biome-ignore lint: lint/suspicious/noConsole
    console.error({ ...diagnostic, error: this.redactor ? this.redactor.redact(error) : error });
  }
}
