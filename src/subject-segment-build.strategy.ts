import type * as tools from "@bgord/tools";
import {
  SubjectSegmentApplicationEmpty,
  type SubjectSegmentApplicationStrategy,
} from "./subject-segment-application.strategy";
import type { SubjectSegmentType } from "./subject-segment-request.strategy";

export class SubjectSegmentBuildStrategy implements SubjectSegmentApplicationStrategy {
  constructor(private readonly build?: tools.PackageVersion) {}

  create(): SubjectSegmentType {
    if (!this.build) return SubjectSegmentApplicationEmpty;
    return this.build.toString();
  }
}
