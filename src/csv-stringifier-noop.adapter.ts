import type { CsvColumnType, CsvRowType, CsvStringifierPort } from "./csv-stringifier.port";

export class CsvStringifierNoopAdapter implements CsvStringifierPort {
  process(_columns: CsvColumnType[], _data: CsvRowType[]) {
    return "noop";
  }
}
