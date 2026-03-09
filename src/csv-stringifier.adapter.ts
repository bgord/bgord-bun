import { text } from "node:stream/consumers";
import type { CsvColumnType, CsvRowType, CsvStringifierPort } from "./csv-stringifier.port";
import { DynamicImport } from "./dynamic-import.service";

export const CsvStringifierAdapterError = {
  MissingDependency: "csv.stringifier.adapter.error.missing.dependency",
};

type CsvLibrary = typeof import("csv");

export class CsvStringifierAdapter implements CsvStringifierPort {
  private static readonly importer = DynamicImport.for<CsvLibrary>(
    "csv",
    CsvStringifierAdapterError.MissingDependency,
  );

  private constructor(private readonly csv: CsvLibrary) {}

  static async build(): Promise<CsvStringifierAdapter> {
    const dependency = await CsvStringifierAdapter.importer.resolve();

    return new CsvStringifierAdapter(dependency);
  }

  async process(columns: ReadonlyArray<CsvColumnType>, data: Array<CsvRowType>): Promise<string> {
    return text(this.csv.stringify(data, { header: true, columns }));
  }
}
