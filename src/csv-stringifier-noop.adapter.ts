import type { CsvColumnType, CsvRowType, CsvStringifierPort } from "./csv-stringifier.port";

export class CsvStringifierNoopAdapter implements CsvStringifierPort {
  async process(_columns: ReadonlyArray<CsvColumnType>, _data: ReadonlyArray<CsvRowType>): Promise<string> {
    return "";
  }
}
