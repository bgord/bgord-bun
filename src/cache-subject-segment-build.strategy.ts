import type * as tools from "@bgord/tools";
import {
  CacheSubjectSegmentApplicationEmpty,
  type CacheSubjectSegmentApplicationStrategy,
} from "./cache-subject-segment-application.strategy";
import type { CacheSubjectSegmentType } from "./cache-subject-segment-request.strategy";

export class CacheSubjectSegmentBuildStrategy implements CacheSubjectSegmentApplicationStrategy {
  constructor(private readonly build?: tools.PackageVersion) {}

  create(): CacheSubjectSegmentType {
    if (!this.build) return CacheSubjectSegmentApplicationEmpty;
    return this.build.toString();
  }
}
