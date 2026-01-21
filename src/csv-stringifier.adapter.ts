import type stream from "node:stream";
import { stringify } from "csv";
import type { CsvColumnType, CsvRowType, CsvStringifierPort } from "./csv-stringifier.port";

export class CsvStringifierAdapter implements CsvStringifierPort {
  process(columns: CsvColumnType[], data: CsvRowType[]): stream.Transform {
    return stringify(data, { header: true, columns });
  }
}
