import type * as VO from "../value-objects";

// fallow-ignore-next-line unused-type
export interface HistoryReaderPort {
  read(subject: VO.HistoryParsedType["subject"]): Promise<ReadonlyArray<VO.HistoryType>>;
}
