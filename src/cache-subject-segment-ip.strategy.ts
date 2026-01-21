import type {
  CacheSubjectSegmentRequestStrategy,
  CacheSubjectSegmentType,
} from "./cache-subject-segment-request.strategy";
import { ClientFromHono } from "./client-from-hono.adapter";
import type { RequestContext } from "./request-context.port";

export class CacheSubjectSegmentIpStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: RequestContext): CacheSubjectSegmentType {
    return ClientFromHono.translate(context).ip;
  }
}
