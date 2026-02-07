export type CsvColumnType = string;
export type CsvRowType = Record<string, any>;

export interface CsvStringifierPort {
  process(columns: ReadonlyArray<CsvColumnType>, data: ReadonlyArray<CsvRowType>): Promise<string>;
}
