import type { Handler } from "hono";

export interface HandlerHonoPort {
  handle(): Handler | Array<Handler>;
}
