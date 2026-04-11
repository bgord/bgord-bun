import type {
  HasIdentityIp,
  HasIdentityUserId,
  HasRequestCookie,
  HasRequestHeader,
  HasRequestParam,
  HasRequestPath,
  HasRequestQuery,
} from "./request-context.port";

export type SubjectSegmentType = string;

export const SubjectSegmentRequestEmpty: SubjectSegmentType = "__absent__";

type RequestContextCapabilities = HasRequestCookie &
  HasRequestHeader &
  HasRequestPath &
  HasRequestQuery &
  HasRequestParam &
  HasIdentityIp &
  HasIdentityUserId;

export interface SubjectSegmentRequestStrategy {
  create(context: RequestContextCapabilities): SubjectSegmentType;
}
