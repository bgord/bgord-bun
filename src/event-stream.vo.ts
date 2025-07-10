import { z } from "zod";

export const EventStream = z.string().min(1).max(256);
export type EventStreamType = z.infer<typeof EventStream>;
