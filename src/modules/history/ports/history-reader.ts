import type * as VO from "../value-objects";

export interface HistoryReaderPort {
  read(subject: VO.HistoryParsedType["subject"]): Promise<VO.HistoryType[]>;
}
