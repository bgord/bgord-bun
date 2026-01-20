type WoodchopperDiagnosticKind = "normalization" | "redaction" | "sink" | "clock";

export type WoodchopperDiagnosticType = { kind: WoodchopperDiagnosticKind; error: unknown };

export interface WoodchopperDiagnosticsStrategy {
  handle: (diagnostic: WoodchopperDiagnosticType) => void;
}
