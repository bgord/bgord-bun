import { describe, expect, test } from "bun:test";
import { EventStreamEraserNoopAdapter } from "../src/event-stream-eraser-noop.adapter";
import * as mocks from "./mocks";

const eraser = new EventStreamEraserNoopAdapter();

describe("EventStreamEraserNoopAdapter", () => {
  test("erase", async () => {
    expect(await eraser.erase(mocks.userId)).toEqual(undefined);
  });
});
