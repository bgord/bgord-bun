import { text } from "node:stream/consumers";
import { stringify } from "csv";
import type { CsvColumnType, CsvRowType, CsvStringifierPort } from "./csv-stringifier.port";

export class CsvStringifierAdapter implements CsvStringifierPort {
  async process(columns: CsvColumnType[], data: CsvRowType[]): Promise<string> {
    return text(stringify(data, { header: true, columns }));
  }
}
