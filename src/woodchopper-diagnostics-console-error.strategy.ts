import * as tools from "@bgord/tools";
import type { RedactorStrategy } from "./redactor.strategy";
import type {
  WoodchopperDiagnosticsStrategy,
  WoodchopperDiagnosticType,
} from "./woodchopper-diagnostics.strategy";

export class WoodchopperDiagnosticsConsoleError implements WoodchopperDiagnosticsStrategy {
  constructor(private readonly redactor?: RedactorStrategy) {}

  handle(diagnostic: WoodchopperDiagnosticType): void {
    const output = { ...diagnostic, error: tools.ErrorNormalizer.normalize(diagnostic.error) };

    // biome-ignore lint: lint/suspicious/noConsole
    console.error(this.redactor ? this.redactor.redact(output) : output);
  }
}
