import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { ReactiveConfigFileJsonAdapter } from "../src/reactive-config-file-json.adapter";
import * as mocks from "./mocks";

const schema = v.object({ maxRetries: v.number("max.retries.invalid"), enabled: v.boolean() });
const config = { maxRetries: 3, enabled: true };
const path = tools.FilePathRelative.fromString("config/feature-flags.json");

const FileReaderJson = new FileReaderJsonNoopAdapter(config);
const deps = { FileReaderJson };

const adapter = new ReactiveConfigFileJsonAdapter(path, schema, deps);

describe("ReactiveConfigFileJsonAdapter", () => {
  test("happy path", async () => {
    const result = await adapter.get();

    expect(result).toEqual(config);
    expect(Object.isFrozen(result)).toEqual(true);
  });

  test("re-reads", async () => {
    using read = spyOn(FileReaderJson, "read");

    await adapter.get();
    await adapter.get();

    expect(read).toHaveBeenCalledTimes(2);
  });

  test("failure - schema violation", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter({ maxRetries: "oops", enabled: true });
    const adapter = new ReactiveConfigFileJsonAdapter(path, schema, { FileReaderJson });

    expect(async () => adapter.get()).toThrow("max.retries.invalid");
  });

  test("failure - async schema", async () => {
    const FileReaderJson = new FileReaderJsonNoopAdapter(config);
    const adapter = new ReactiveConfigFileJsonAdapter(path, mocks.asyncSchema, { FileReaderJson });

    expect(async () => adapter.get()).toThrow("reactive.config.no.async.schema");
  });
});
