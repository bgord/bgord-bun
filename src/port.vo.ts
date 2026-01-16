import * as z from "zod/v4";

export const PortError = { Type: "port.type", Invalid: "port.invalid" } as const;

// Stryker disable all
export const Port = z.coerce
  // Stryker restore all
  .number(PortError.Type)
  .int(PortError.Type)
  .min(0, PortError.Invalid)
  .max(99999, PortError.Invalid)
  .brand("Port");

export type PortType = z.infer<typeof Port>;
