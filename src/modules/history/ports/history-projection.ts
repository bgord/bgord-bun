import * as tools from "@bgord/tools";
import * as VO from "../value-objects";

export interface HistoryProjectionPort {
  append(data: VO.HistoryParsedType, createdAt: tools.TimestampType): Promise<void>;

  clear(subject: VO.HistoryParsedType["subject"]): Promise<void>;
}
