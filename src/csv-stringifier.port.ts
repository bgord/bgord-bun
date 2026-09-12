// cSpell:ignore stringifier
import type { CsvColumnType, CsvRowType } from "./csv.types";

export interface CsvStringifierPort {
  process(columns: ReadonlyArray<CsvColumnType>, data: ReadonlyArray<CsvRowType>): Promise<string>;
}
