import { z } from "zod/v4";

export const PortError = { Type: "port.type", Invalid: "port.invalid" } as const;

export const Port = z.coerce
  .number(PortError.Type)
  .int(PortError.Type)
  .min(0, PortError.Invalid)
  .max(99999, PortError.Invalid)
  .brand("Port");

export type PortType = z.infer<typeof Port>;
