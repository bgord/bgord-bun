import { describe, expect, test } from "bun:test";
import { CorrelationStorage } from "../src/correlation-storage.service";

const delay = () => new Promise<void>((r) => setTimeout(r, 0));

describe("CorrelationStorage.run / get", () => {
  test("makes the correlationId available inside the callback", () => {
    const id = "cid-1";

    CorrelationStorage.run(id, () => {
      expect(CorrelationStorage.get()).toBe(id);
    });
  });

  test("propagates across awaits/promises", async () => {
    const id = "cid-async";

    await CorrelationStorage.run(id, async () => {
      await delay(); // hop to a different async resource
      expect(CorrelationStorage.get()).toBe(id);
    });
  });

  test("throws when accessed outside a run-context", () => {
    expect(() => CorrelationStorage.get()).toThrow("CorrelationId missing");
  });
});

describe("Nested run() calls", () => {
  test("restores the outer id after the inner context finishes", () => {
    CorrelationStorage.run("outer", () => {
      expect(CorrelationStorage.get()).toBe("outer");

      CorrelationStorage.run("inner", () => {
        expect(CorrelationStorage.get()).toBe("inner");
      });

      expect(CorrelationStorage.get()).toBe("outer");
    });
  });
});

describe("CorrelationStorage.handle() middleware", () => {
  test("seeds AsyncLocalStorage with requestId", async () => {
    const id = "cid-mw";

    const ctx = {
      get: (key: string) => (key === "requestId" ? id : undefined),
    } as any;

    let seen: string | undefined;

    const next = () => {
      seen = CorrelationStorage.get();
    };

    const middleware = CorrelationStorage.handle();

    await middleware(ctx, next as any);

    expect(seen).toBe(id);
  });

  test("cleans up after the request completes", async () => {
    const id = "cid-cleanup";
    const middleware = CorrelationStorage.handle();

    await middleware({ get: () => id } as any, () => Promise.resolve());

    expect(() => CorrelationStorage.get()).toThrow();
  });
});
