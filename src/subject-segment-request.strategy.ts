import type {
  HasIdentityIp,
  HasIdentityRemoteIp,
  HasIdentityUserId,
  HasRequestCookie,
  HasRequestHeader,
  HasRequestMethod,
  HasRequestParam,
  HasRequestPath,
  HasRequestQueries,
} from "./request-context.port";

export type SubjectSegmentType = string | null;
export type SubjectSegmentsRawType = ReadonlyArray<readonly [string, SubjectSegmentType]>;

export const SubjectSegmentRequestEmpty: SubjectSegmentType = null;

type RequestContextCapabilities = HasRequestCookie &
  HasRequestHeader &
  HasRequestMethod &
  HasRequestPath &
  HasRequestQueries &
  HasRequestParam &
  HasIdentityIp &
  HasIdentityRemoteIp &
  HasIdentityUserId;

export interface SubjectSegmentRequestStrategy {
  readonly label: string;
  create(context: RequestContextCapabilities): SubjectSegmentType;
}
