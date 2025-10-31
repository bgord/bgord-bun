import type * as VO from "../value-objects";

export interface HistoryProjectionPort {
  append(data: VO.HistoryParsedType): Promise<void>;

  clear(subject: VO.HistoryParsedType["subject"]): Promise<void>;
}
