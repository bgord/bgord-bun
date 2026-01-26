import { text } from "node:stream/consumers";
import type { CsvColumnType, CsvRowType, CsvStringifierPort } from "./csv-stringifier.port";

export const CsvStringifierAdapterError = {
  MissingDependency: "csv.stringifier.adapter.error.missing.dependency",
};

type CsvLibrary = typeof import("csv");

export class CsvStringifierAdapter implements CsvStringifierPort {
  private constructor(private readonly csv: CsvLibrary) {}

  static async build(): Promise<CsvStringifierAdapter> {
    return new CsvStringifierAdapter(await CsvStringifierAdapter.resolve());
  }

  private static async resolve(): Promise<CsvLibrary> {
    try {
      return await CsvStringifierAdapter.import();
    } catch {
      throw new Error(CsvStringifierAdapterError.MissingDependency);
    }
  }

  static async import(): Promise<CsvLibrary> {
    const name = "c" + "sv"; // Bun does not resolve dynamic imports with a dynamic name
    return import(name) as Promise<CsvLibrary>;
  }

  async process(columns: CsvColumnType[], data: CsvRowType[]): Promise<string> {
    return text(this.csv.stringify(data, { header: true, columns }));
  }
}
