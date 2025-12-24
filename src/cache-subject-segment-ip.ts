import type { Context } from "hono";
import type { CacheSubjectSegmentPort } from "./cache-subject-segment.port";
import { Client } from "./client.vo";

export class CacheSubjectSegmentIp implements CacheSubjectSegmentPort {
  create(context?: Context) {
    if (!context) return "";
    return Client.fromHonoContext(context).ip;
  }
}
