import { describe, expect, test } from "bun:test";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const entry = { message: "message", component: "infra", operation: "test" };
const entryHttp = {
  message: "message",
  component: "http",
  operation: "test",
  method: "GET",
  url: "http://localhost:3000",
  client: { ua: mocks.ua, ip: mocks.ip },
} as const;
const entryWithErrorString = { ...entry, error: mocks.IntentionalError };

describe("LoggerCollectingAdapter", () => {
  test("happy path", () => {
    const adapter = new LoggerCollectingAdapter();

    adapter.warn(entry);
    adapter.error(entryWithErrorString);
    adapter.info(entry);
    adapter.http(entryHttp);
    adapter.verbose(entry);
    adapter.debug(entry);
    adapter.silly(entry);

    expect(adapter.entries).toEqual([entry, entryWithErrorString, entry, entryHttp, entry, entry, entry]);
  });
});
