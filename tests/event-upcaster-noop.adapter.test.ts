import { describe, expect, test } from "bun:test";
import { EventUpcasterNoopAdapter } from "../src/event-upcaster-noop.adapter";
import * as mocks from "./mocks";

const upcaster = new EventUpcasterNoopAdapter();

describe("EventUpcasterNoopAdapter", () => {
  test("upcast", () => {
    expect(upcaster.upcast(mocks.GenericHourHasPassedEvent)).toEqual(mocks.GenericHourHasPassedEvent);
  });
});
