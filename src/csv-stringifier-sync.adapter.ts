import { stringify } from "csv";
import type { CsvColumnType, CsvRowType, CsvStringifierPort } from "./csv-stringifier.port";

export class CsvStringifierSyncAdapter implements CsvStringifierPort {
  process(columns: CsvColumnType[], data: CsvRowType[]) {
    return stringify(data, { header: true, columns });
  }
}
