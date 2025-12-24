import type { Context } from "hono";
import type { CacheSubjectSegmentPort } from "./cache-subject-segment.port";
import { ClientFromHono } from "./client-from-hono.adapter";

export class CacheSubjectSegmentIp implements CacheSubjectSegmentPort {
  create(context?: Context) {
    if (!context) return "";
    return ClientFromHono.translate(context).ip;
  }
}
