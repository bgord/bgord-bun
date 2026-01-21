import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { CacheSubjectSegmentType } from "./cache-subject-segment-request.strategy";
import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
} from "./cache-subject-segment-request.strategy";

export class CacheSubjectSegmentCookieStrategy implements CacheSubjectSegmentRequestStrategy {
  constructor(private readonly name: string) {}

  create(context: Context): CacheSubjectSegmentType {
    return getCookie(context, this.name) ?? CacheSubjectSegmentRequestEmpty;
  }
}
