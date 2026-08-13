import * as v from "valibot";
import { Port } from "./port.vo";

export const SmtpPort = v.pipe(Port, v.brand("SmtpPort"));
export type SmtpPortType = v.InferOutput<typeof SmtpPort>;
