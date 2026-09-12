import type { CsvParsedRowType } from "./csv.types";

export interface CsvParserPort {
  process(content: string): Promise<ReadonlyArray<CsvParsedRowType>>;
}
