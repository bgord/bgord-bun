import { z } from "zod";

export const Port = z.coerce.number().min(0).max(99999).brand("Port");

export type PortType = z.infer<typeof Port>;
