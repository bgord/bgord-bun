import type * as VO from "../value-objects";

export interface UserDirectoryOHQ {
  listActiveUserIds(): Promise<ReadonlyArray<VO.UserIdType>>;
}
