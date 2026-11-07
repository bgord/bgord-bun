// cspell:ignore Stringifier
import type { CsvColumnType, CsvRowType } from "./csv.types";
import { CsvFormulaSanitizer } from "./csv-formula-sanitizer.service";
import type { CsvStringifierPort } from "./csv-stringifier.port";

export const CsvStringifierAdapterError = { InvalidValue: "csv.stringifier.adapter.invalid.value" };

class CsvField {
  private static readonly QUOTE_TRIGGER = /[",\r\n]/;

  constructor(private readonly value: unknown) {}

  serialize(): string {
    const text = this.cast();

    if (!CsvField.QUOTE_TRIGGER.test(text)) return text;
    return `"${text.replaceAll('"', '""')}"`;
  }

  private cast(): string {
    const value = this.value;

    if (value === null || value === undefined) return "";
    if (typeof value === "string") return CsvFormulaSanitizer.sanitize(value);
    if (typeof value === "number" || typeof value === "bigint") return String(value);
    if (typeof value === "boolean") return value ? "1" : "";
    if (value instanceof Date) return String(value.getTime());
    if (typeof value === "object") return JSON.stringify(value);

    throw new Error(CsvStringifierAdapterError.InvalidValue);
  }
}

export class CsvStringifierAdapter implements CsvStringifierPort {
  static readonly FIELD_SEPARATOR = ",";
  static readonly RECORD_TERMINATOR = "\n";

  async process(columns: ReadonlyArray<CsvColumnType>, data: ReadonlyArray<CsvRowType>): Promise<string> {
    const records = data.map((row) => columns.map((column) => row[column]));

    return [columns, ...records].map((record) => this.record(record)).join("");
  }

  private record(fields: ReadonlyArray<unknown>): string {
    const serialized = fields.map((field) => new CsvField(field).serialize());

    return `${serialized.join(CsvStringifierAdapter.FIELD_SEPARATOR)}${CsvStringifierAdapter.RECORD_TERMINATOR}`;
  }
}
