import type * as tools from "@bgord/tools";

export type Page<Entry, Cursor> = { entries: ReadonlyArray<Entry>; next: Cursor | null };

export const Page = {
  take(limit: tools.IntegerPositiveType): number {
    return limit + 1;
  },

  of<Entry, Cursor>(
    rows: ReadonlyArray<Entry>,
    limit: tools.IntegerPositiveType,
    cursor: (entry: Entry) => Cursor,
  ): Page<Entry, Cursor> {
    if (rows.length <= limit) return { entries: rows, next: null };

    const entries = rows.slice(0, limit);

    return { entries, next: cursor(entries.at(-1) as Entry) };
  },
};
