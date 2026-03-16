import type * as v from "valibot";
import { Port } from "./port.vo";

export const SmtpPort = Port;
export type SmtpPortType = v.InferOutput<typeof SmtpPort>;
