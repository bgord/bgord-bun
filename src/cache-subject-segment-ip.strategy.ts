import type { Context } from "hono";
import { CacheSubjectSegmentEmpty, type CacheSubjectSegmentStrategy } from "./cache-subject-segment.strategy";
import { ClientFromHono } from "./client-from-hono.adapter";

export class CacheSubjectSegmentIpStrategy implements CacheSubjectSegmentStrategy {
  create(context?: Context) {
    if (!context) return CacheSubjectSegmentEmpty;
    return ClientFromHono.translate(context).ip;
  }
}
