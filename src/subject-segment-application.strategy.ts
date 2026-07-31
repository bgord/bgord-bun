import type { SubjectSegmentType } from "./subject-segment-request.strategy";

export const SubjectSegmentApplicationEmpty: SubjectSegmentType = null;

export interface SubjectSegmentApplicationStrategy {
  create(): SubjectSegmentType;
}
