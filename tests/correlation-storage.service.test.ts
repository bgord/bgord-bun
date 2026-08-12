import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { CorrelationId } from "../src/correlation-id.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import * as mocks from "./mocks";

const outer = mocks.correlationId;
const inner = v.parse(CorrelationId, "bf732a6a-fcb8-4c24-ae79-fd51c96b17e5");

describe("CorrelationStorage", () => {
  test("run - sync", () => {
    CorrelationStorage.run(mocks.correlationId, () =>
      expect(CorrelationStorage.get()).toEqual(mocks.correlationId),
    );
  });

  test("run - async", async () => {
    await CorrelationStorage.run(mocks.correlationId, async () =>
      expect(CorrelationStorage.get()).toEqual(mocks.correlationId),
    );
  });

  test("run - outside context", () => {
    expect(() => CorrelationStorage.get()).toThrow("correlation.storage.missing");
  });

  test("run - inner and outer", () => {
    CorrelationStorage.run(outer, () => {
      expect(CorrelationStorage.get()).toEqual(outer);

      CorrelationStorage.run(inner, () => expect(CorrelationStorage.get()).toEqual(inner));

      expect(CorrelationStorage.get()).toEqual(outer);
    });
  });

  test("global symbol", () => {
    // @ts-expect-error
    expect(CorrelationStorage.GLOBAL_KEY).toEqual(Symbol.for("bgord.CorrelationStorage"));
  });
});
