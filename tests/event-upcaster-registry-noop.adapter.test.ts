import { describe, expect, test } from "bun:test";
import { EventUpcasterRegistryNoopAdapter } from "../src/event-upcaster-registry-noop.adapter";
import * as mocks from "./mocks";

describe("EventUpcasterRegistryNoopAdapter", () => {
  test("returns the event unchanged", () => {
    const registry = new EventUpcasterRegistryNoopAdapter();

    expect(registry.upcast(mocks.GenericHourHasPassedEvent)).toEqual(mocks.GenericHourHasPassedEvent);
  });
});
