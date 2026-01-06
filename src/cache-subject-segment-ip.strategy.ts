import type { Context } from "hono";
import type { CacheSubjectSegmentRequestStrategy } from "./cache-subject-segment-request.strategy";
import { ClientFromHono } from "./client-from-hono.adapter";

export class CacheSubjectSegmentIpStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: Context) {
    return ClientFromHono.translate(context).ip;
  }
}
