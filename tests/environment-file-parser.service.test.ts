import { describe, expect, test } from "bun:test";
import { EnvironmentFileParser } from "../src/environment-file-parser.service";

describe("EnvironmentFileParser service", () => {
  test("single key value", () => {
    const result = EnvironmentFileParser.parse("FOO=bar");

    expect(result).toEqual({ FOO: "bar" });
  });

  test("multiple key value", () => {
    const result = EnvironmentFileParser.parse("FOO=bar\nBAZ=qux");

    expect(result).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  test("empty", () => {
    const result = EnvironmentFileParser.parse("");

    expect(result).toEqual({});
  });

  test("empty values", () => {
    const result = EnvironmentFileParser.parse(`FOO=\nBAR=""\nBAZ=''\n`);

    expect(result).toEqual({ FOO: "", BAR: "", BAZ: "" });
  });

  test("empty lines ignored", () => {
    const result = EnvironmentFileParser.parse("\n\nFOO=bar\n\n\nBAZ=qux\n\n");

    expect(result).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  test("trimming", () => {
    const result = EnvironmentFileParser.parse("FOO   =   bar\nBAZ=qux   ");

    expect(result).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  test("only comments", () => {
    const result = EnvironmentFileParser.parse("# comment one\n# comment two\n   # indented comment ");

    expect(result).toEqual({});
  });

  test("double quoted values", () => {
    const result = EnvironmentFileParser.parse(`FOO="bar baz"`);

    expect(result).toEqual({ FOO: "bar baz" });
  });

  test("single quoted values", () => {
    const result = EnvironmentFileParser.parse(`FOO='bar baz'`);

    expect(result).toEqual({ FOO: "bar baz" });
  });

  test("no quotes stripping one quoted sides", () => {
    const result = EnvironmentFileParser.parse(`FOO="bar\nBAR=bar"`);

    expect(result).toEqual({ FOO: `"bar`, BAR: `bar"` });
  });

  test("preserves mismatched opening quotes", () => {
    const result = EnvironmentFileParser.parse(`FOO='bar`);

    expect(result).toEqual({ FOO: "'bar" });
  });

  test("preserves mismatched closing quote", () => {
    const result = EnvironmentFileParser.parse(`FOO=bar'`);

    expect(result).toEqual({ FOO: "bar'" });
  });

  test("equals characters in values", () => {
    const result = EnvironmentFileParser.parse(
      "DATABASE_URL=postgres://user:pass@localhost:5432/db?ssl=true",
    );

    expect(result).toEqual({ DATABASE_URL: "postgres://user:pass@localhost:5432/db?ssl=true" });
  });

  test("ignores lines without equals", () => {
    const result = EnvironmentFileParser.parse("FOO=bar\n INVALID_LINE\n BAZ=qux");

    expect(result).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  test("value overrides", () => {
    const result = EnvironmentFileParser.parse("FOO=bar\nFOO=baz");

    expect(result).toEqual({ FOO: "baz" });
  });

  test("inline comments preserved", () => {
    const result = EnvironmentFileParser.parse("FOO=bar#");

    expect(result).toEqual({ FOO: "bar#" });
  });

  test("different new lines", () => {
    const unixContent = "FOO=bar\nBAZ=qux\n";
    const windowsContent = "FOO=bar\r\nBAZ=qux\r\n";

    const unixResult = EnvironmentFileParser.parse(unixContent);
    const windowsResult = EnvironmentFileParser.parse(windowsContent);

    expect(unixResult).toEqual(windowsResult);
  });
});
