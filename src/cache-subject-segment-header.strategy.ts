import type { Context } from "hono";
import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
} from "./cache-subject-segment-request.strategy";

export class CacheSubjectSegmentHeaderStrategy implements CacheSubjectSegmentRequestStrategy {
  constructor(private readonly name: string) {}

  create(context: Context) {
    return context.req.header(this.name) ?? CacheSubjectSegmentRequestEmpty;
  }
}
