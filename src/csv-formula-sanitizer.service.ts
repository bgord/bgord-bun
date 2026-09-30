export class CsvFormulaSanitizer {
  static readonly TRIGGERS = ["=", "+", "-", "@", "\t", "\r"];

  static sanitize(value: string): string {
    const triggered = CsvFormulaSanitizer.TRIGGERS.some((trigger) => value.startsWith(trigger));

    return triggered ? `'${value}` : value;
  }
}
