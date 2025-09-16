import type stream from "node:stream";

export type CsvColumnType = string;
export type CsvRowType = Record<string, any>;

export interface CsvStringifierPort {
  process(columns: CsvColumnType[], data: CsvRowType[]): stream.Transform;
}
