import type * as VO from "../value-objects";

// fallow-ignore-next-line unused-type
export interface HistoryWriterPort {
  populate(history: Omit<VO.HistoryType, "id">): Promise<void>;

  clear(subject: VO.HistorySubjectType): Promise<void>;
}
