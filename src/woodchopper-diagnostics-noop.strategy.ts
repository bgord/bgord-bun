import type {
  WoodchopperDiagnosticsStrategy,
  WoodchopperDiagnosticType,
} from "./woodchopper-diagnostics.strategy";

export class WoodchopperDiagnosticsNoop implements WoodchopperDiagnosticsStrategy {
  handle(_diagnostic: WoodchopperDiagnosticType): void {}
}
