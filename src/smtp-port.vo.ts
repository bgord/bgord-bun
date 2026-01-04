import type { z } from "zod/v4";
import { Port } from "./port.vo";

export const SmtpPort = Port;
export type SmtpPortType = z.infer<typeof SmtpPort>;
