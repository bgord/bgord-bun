import type { CacheSubjectSegmentApplicationStrategy } from "./cache-subject-segment-application.strategy";
import type { NodeEnvironmentEnum } from "./node-env.vo";

export class CacheSubjectSegmentEnvStrategy implements CacheSubjectSegmentApplicationStrategy {
  constructor(private readonly type: NodeEnvironmentEnum) {}

  create() {
    return this.type;
  }
}
