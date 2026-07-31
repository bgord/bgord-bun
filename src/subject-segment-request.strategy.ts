import type {
  HasIdentityIp,
  HasIdentityUserId,
  HasRequestCookie,
  HasRequestHeader,
  HasRequestMethod,
  HasRequestParam,
  HasRequestPath,
  HasRequestQueries,
} from "./request-context.port";

export type SubjectSegmentType = string | null;

export const SubjectSegmentRequestEmpty: SubjectSegmentType = null;

type RequestContextCapabilities = HasRequestCookie &
  HasRequestHeader &
  HasRequestMethod &
  HasRequestPath &
  HasRequestQueries &
  HasRequestParam &
  HasIdentityIp &
  HasIdentityUserId;

export interface SubjectSegmentRequestStrategy {
  create(context: RequestContextCapabilities): SubjectSegmentType;
}
