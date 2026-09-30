import { describe, expect, test } from "bun:test";
import { CsvFormulaSanitizer } from "../src/csv-formula-sanitizer.service";

describe("CsvFormulaSanitizer", () => {
  test("equals", () => {
    expect(CsvFormulaSanitizer.sanitize('=HYPERLINK("http://evil.example","CLICK")')).toEqual(
      `'=HYPERLINK("http://evil.example","CLICK")`,
    );
  });

  test("plus", () => {
    expect(CsvFormulaSanitizer.sanitize("+1+1")).toEqual("'+1+1");
  });

  test("minus", () => {
    expect(CsvFormulaSanitizer.sanitize("-1+1")).toEqual("'-1+1");
  });

  test("at", () => {
    expect(CsvFormulaSanitizer.sanitize("@SUM(A1)")).toEqual("'@SUM(A1)");
  });

  test("tab", () => {
    expect(CsvFormulaSanitizer.sanitize("\t=1+1")).toEqual("'\t=1+1");
  });

  test("carriage return", () => {
    expect(CsvFormulaSanitizer.sanitize("\r=1+1")).toEqual("'\r=1+1");
  });

  test("plain text", () => {
    expect(CsvFormulaSanitizer.sanitize("Left calf")).toEqual("Left calf");
  });

  test("trigger not leading", () => {
    expect(CsvFormulaSanitizer.sanitize("a=1+1")).toEqual("a=1+1");
  });

  test("empty", () => {
    expect(CsvFormulaSanitizer.sanitize("")).toEqual("");
  });

  test("unbound", () => {
    const sanitize = CsvFormulaSanitizer.sanitize;

    expect(sanitize("=1+1")).toEqual("'=1+1");
  });
});
