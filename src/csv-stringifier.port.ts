export type CsvColumnType = string;
export type CsvRowType = Record<string, any>;

export interface CsvStringifierPort {
  process(columns: CsvColumnType[], data: CsvRowType[]): Promise<string>;
}
