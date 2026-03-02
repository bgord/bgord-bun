import type {
  HasIdentityIp,
  HasIdentityUserId,
  HasRequestCookie,
  HasRequestHeader,
  HasRequestPath,
  HasRequestQuery,
} from "./request-context.port";

export type SubjectSegmentType = string;

export const SubjectSegmentRequestEmpty: SubjectSegmentType = "__absent__";

type RequestContextCapabilities = HasRequestCookie &
  HasRequestHeader &
  HasRequestPath &
  HasRequestQuery &
  HasIdentityIp &
  HasIdentityUserId;

export interface SubjectSegmentRequestStrategy {
  create(context: RequestContextCapabilities): SubjectSegmentType;
}
