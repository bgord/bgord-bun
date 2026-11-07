// cspell:ignore Stringifier
import { describe, expect, test } from "bun:test";
import { CsvStringifierAdapter } from "../src/csv-stringifier.adapter";

const adapter = new CsvStringifierAdapter();

describe("CsvStringifierAdapter", () => {
  test("process", async () => {
    const columns = ["id", "name"];
    const data = [
      { id: 1, name: "Anne" },
      { id: 2, name: "Bob" },
    ];

    expect(await adapter.process(columns, data)).toEqual("id,name\n1,Anne\n2,Bob\n");
  });

  test("process - empty", async () => {
    expect(await adapter.process(["id", "name"], [])).toEqual("id,name\n");
  });

  test("process - column order", async () => {
    const data = [{ name: "Anne", id: 1, ignored: "x" }];

    expect(await adapter.process(["id", "name"], data)).toEqual("id,name\n1,Anne\n");
  });

  test("process - missing values", async () => {
    const data = [{ id: null, name: undefined }, {}];

    expect(await adapter.process(["id", "name"], data)).toEqual("id,name\n,\n,\n");
  });

  test("process - numbers", async () => {
    const data = [{ id: -3, name: 1.5 }];

    expect(await adapter.process(["id", "name"], data)).toEqual("id,name\n-3,1.5\n");
  });

  test("process - bigint", async () => {
    const data = [{ id: 10n, name: "Anne" }];

    expect(await adapter.process(["id", "name"], data)).toEqual("id,name\n10,Anne\n");
  });

  test("process - booleans", async () => {
    const data = [{ id: true, name: false }];

    expect(await adapter.process(["id", "name"], data)).toEqual("id,name\n1,\n");
  });

  test("process - date", async () => {
    // biome-ignore lint: lint/style/noRestrictedGlobals
    const data = [{ id: 1, name: new Date(1_700_000_000_000) }];

    expect(await adapter.process(["id", "name"], data)).toEqual("id,name\n1,1700000000000\n");
  });

  test("process - object", async () => {
    const data = [{ id: 1, name: { first: "Anne" } }];

    expect(await adapter.process(["id", "name"], data)).toEqual('id,name\n1,"{""first"":""Anne""}"\n');
  });

  test("process - array", async () => {
    const data = [{ id: 1, name: [1, 2] }];

    expect(await adapter.process(["id", "name"], data)).toEqual('id,name\n1,"[1,2]"\n');
  });

  test("process - array not sanitized", async () => {
    const data = [{ id: 1, name: ["=1"] }];

    expect(await adapter.process(["id", "name"], data)).toEqual('id,name\n1,"[""=1""]"\n');
  });

  test("process - symbol", async () => {
    const data = [{ id: 1, name: Symbol("Anne") }];

    expect(async () => adapter.process(["id", "name"], data)).toThrow("csv.stringifier.adapter.invalid.value");
  });

  test("process - function", async () => {
    const data = [{ id: 1, name: () => "Anne" }];

    expect(async () => adapter.process(["id", "name"], data)).toThrow("csv.stringifier.adapter.invalid.value");
  });

  test("process - empty string", async () => {
    const data = [{ id: 0, name: "" }];

    expect(await adapter.process(["id", "name"], data)).toEqual("id,name\n0,\n");
  });

  test("process - comma", async () => {
    const data = [{ id: 1, name: "Anne, Bob" }];

    expect(await adapter.process(["id", "name"], data)).toEqual('id,name\n1,"Anne, Bob"\n');
  });

  test("process - quote", async () => {
    const data = [{ id: 1, name: 'say "hi"' }];

    expect(await adapter.process(["id", "name"], data)).toEqual('id,name\n1,"say ""hi"""\n');
  });

  test("process - line feed", async () => {
    const data = [{ id: 1, name: "line\nbreak" }];

    expect(await adapter.process(["id", "name"], data)).toEqual('id,name\n1,"line\nbreak"\n');
  });

  test("process - carriage return", async () => {
    const data = [{ id: 1, name: "line\rbreak" }];

    expect(await adapter.process(["id", "name"], data)).toEqual('id,name\n1,"line\rbreak"\n');
  });

  test("process - whitespace kept", async () => {
    const data = [{ id: 1, name: " Anne " }];

    expect(await adapter.process(["id", "name"], data)).toEqual("id,name\n1, Anne \n");
  });

  test("process - formula sanitized", async () => {
    const data = [{ id: 1, name: "=SUM(A1)" }];

    expect(await adapter.process(["id", "name"], data)).toEqual("id,name\n1,'=SUM(A1)\n");
  });

  test("process - formula sanitized and quoted", async () => {
    const data = [{ id: 1, name: '=HYPERLINK("x")' }];

    expect(await adapter.process(["id", "name"], data)).toEqual(`id,name\n1,"'=HYPERLINK(""x"")"\n`);
  });

  test("process - header sanitized and quoted", async () => {
    expect(await adapter.process(["=id", "first,name"], [])).toEqual(`'=id,"first,name"\n`);
  });
});
