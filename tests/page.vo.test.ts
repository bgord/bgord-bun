import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Page } from "../src/page.vo";

const limit = tools.Int.positive(2);
const cursor = (entry: { id: number }) => entry.id;

describe("Page", () => {
  test("take", () => {
    expect(Page.take(limit)).toEqual(3);
  });

  test("of - empty", () => {
    expect(Page.of([], limit, cursor)).toEqual({ entries: [], next: null });
  });

  test("of - fewer than limit", () => {
    expect(Page.of([{ id: 1 }], limit, cursor)).toEqual({ entries: [{ id: 1 }], next: null });
  });

  test("of - exactly limit", () => {
    expect(Page.of([{ id: 1 }, { id: 2 }], limit, cursor)).toEqual({
      entries: [{ id: 1 }, { id: 2 }],
      next: null,
    });
  });

  test("of - more than limit", () => {
    expect(Page.of([{ id: 1 }, { id: 2 }, { id: 3 }], limit, cursor)).toEqual({
      entries: [{ id: 1 }, { id: 2 }],
      next: 2,
    });
  });
});
