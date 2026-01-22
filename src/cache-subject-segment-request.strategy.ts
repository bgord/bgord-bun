import type {
  HasIdentityIp,
  HasIdentityUserId,
  HasRequestCookie,
  HasRequestHeader,
  HasRequestPath,
  HasRequestQuery,
} from "./request-context.port";

export const CacheSubjectSegmentRequestEmpty: CacheSubjectSegmentType = "__absent__";

export type CacheSubjectSegmentType = string;

type RequestContextCapabilities = HasRequestCookie &
  HasRequestHeader &
  HasRequestPath &
  HasRequestQuery &
  HasIdentityIp &
  HasIdentityUserId;

export interface CacheSubjectSegmentRequestStrategy {
  create(context: RequestContextCapabilities): CacheSubjectSegmentType;
}
