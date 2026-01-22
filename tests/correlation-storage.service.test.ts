import { describe, expect, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";
import * as mocks from "./mocks";

describe("CorrelationStorage service", () => {
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
    CorrelationStorage.run("outer", () => {
      expect(CorrelationStorage.get()).toEqual("outer");

      CorrelationStorage.run("inner", () => expect(CorrelationStorage.get()).toEqual("inner"));

      expect(CorrelationStorage.get()).toEqual("outer");
    });
  });

  test("handle - seeding", async () => {
    const context = { get: () => mocks.correlationId };

    // @ts-expect-error TODO
    const result = await CorrelationStorage.handle()(context, () => CorrelationStorage.get());

    // @ts-expect-error TODO
    expect(result).toEqual(mocks.correlationId);
  });

  test("handle - cleanup", async () => {
    const context = { get: () => mocks.correlationId };

    // @ts-expect-error TODO
    await CorrelationStorage.handle()(context, async () => {});

    expect(() => CorrelationStorage.get()).toThrow("correlation.storage.missing");
  });

  test("global symbol", () => {
    // @ts-expect-error
    expect(CorrelationStorage.GLOBAL_KEY).toEqual(Symbol.for("bgord.CorrelationStorage"));
  });
});
