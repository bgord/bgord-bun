import type { Context } from "hono";
import type {
  CacheSubjectSegmentRequestStrategy,
  CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";
import { ClientFromHono } from "./client-from-hono.adapter";

export class CacheSubjectSegmentIpStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: Context): CacheSubjectSegmentType {
    return ClientFromHono.translate(context).ip;
  }
}
