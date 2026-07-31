import type {
  HasIdentityIp,
  HasIdentityUserId,
  HasRequestCookie,
  HasRequestHeader,
  HasRequestMethod,
  HasRequestParam,
  HasRequestPath,
  HasRequestQuery,
} from "./request-context.port";

export type SubjectSegmentType = string;

export const SubjectSegmentRequestEmpty: SubjectSegmentType = "__absent__";

type RequestContextCapabilities = HasRequestCookie &
  HasRequestHeader &
  HasRequestMethod &
  HasRequestPath &
  HasRequestQuery &
  HasRequestParam &
  HasIdentityIp &
  HasIdentityUserId;

export interface SubjectSegmentRequestStrategy {
  create(context: RequestContextCapabilities): SubjectSegmentType;
}
