import type { CacheSubjectSegmentPort } from "./cache-subject-segment.port";

export class CacheSubjectSegmentFixed implements CacheSubjectSegmentPort {
  constructor(private readonly value: string) {}

  create() {
    return this.value;
  }
}
