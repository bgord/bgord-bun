import { describe, expect, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";

describe("CorrelationStorage", () => {
  test("run - makes the correlationId available inside the callback", () => {
    const id = "cid-1";

    CorrelationStorage.run(id, () => expect(CorrelationStorage.get()).toEqual(id));
  });

  test("run - propagates across awaits/promises", async () => {
    const id = "cid-async";

    await CorrelationStorage.run(id, async () => expect(CorrelationStorage.get()).toEqual(id));
  });

  test("run - throws when accessed outside a run-context", () => {
    expect(() => CorrelationStorage.get()).toThrow("CorrelationId missing");
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

    const ctx = { get: (key: string) => (key === "requestId" ? id : undefined) } as any;

    let seen: string | undefined;

    const next = () => {
      seen = CorrelationStorage.get();
    };

    await CorrelationStorage.handle()(ctx, next as any);

    expect(seen).toEqual(id);
  });

  test("handle - cleans up after the request completes", async () => {
    const id = "cid-cleanup";
    await CorrelationStorage.handle()({ get: () => id } as any, () => Promise.resolve());
    expect(() => CorrelationStorage.get()).toThrow();
  });
});
