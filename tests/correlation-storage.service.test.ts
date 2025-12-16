import { describe, expect, test } from "bun:test";
import { CorrelationStorage, CorrelationStorageError } from "../src/correlation-storage.service";

describe("CorrelationStorage service", () => {
  test("run - makes the correlationId available inside the callback", () => {
    const id = "cid-1";

    CorrelationStorage.run(id, () => expect(CorrelationStorage.get()).toEqual(id));
  });

  test("run - propagates across awaits/promises", async () => {
    const id = "cid-async";

    await CorrelationStorage.run(id, async () => expect(CorrelationStorage.get()).toEqual(id));
  });

  test("run - throws when accessed outside a run-context", () => {
    expect(() => CorrelationStorage.get()).toThrow(CorrelationStorageError.Missing);
  });

  test("run - inner and outer", () => {
    CorrelationStorage.run("outer", () => {
      expect(CorrelationStorage.get()).toEqual("outer");
      CorrelationStorage.run("inner", () => expect(CorrelationStorage.get()).toEqual("inner"));
      expect(CorrelationStorage.get()).toEqual("outer");
    });
  });

  test("handle - seeds requestId", async () => {
    const id = "cid-mw";
    const context = { get: () => id } as any;

    const result = await CorrelationStorage.handle()(context, () => CorrelationStorage.get() as any);

    // @ts-expect-error
    expect(result).toEqual(id);
  });

  test("handle - cleans up after the request completes", async () => {
    const context = { get: () => "cid-cleanup" } as any;

    await CorrelationStorage.handle()(context, () => Promise.resolve());

    expect(() => CorrelationStorage.get()).toThrow(CorrelationStorageError.Missing);
  });
});
