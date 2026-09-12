import type { CsvParsedRowType } from "./csv.types";
import type { CsvParserPort } from "./csv-parser.port";

export class CsvParserNoopAdapter implements CsvParserPort {
  constructor(private readonly result: ReadonlyArray<CsvParsedRowType>) {}

  async process(_content: string): Promise<ReadonlyArray<CsvParsedRowType>> {
    return this.result;
  }
}
