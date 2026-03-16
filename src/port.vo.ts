import * as v from "valibot";

export const PortError = { Type: "port.type", Invalid: "port.invalid" } as const;

export const Port = v.pipe(
  v.unknown(),
  v.transform(Number),
  v.number(PortError.Type),
  v.integer(PortError.Type),
  v.minValue(0, PortError.Invalid),
  v.maxValue(99999, PortError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("Port"),
);

export type PortType = v.InferOutput<typeof Port>;
