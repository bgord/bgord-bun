import type * as tools from "@bgord/tools";

export type EventStoreLike<E extends { name: string }> = {
  save(events: E[]): Promise<unknown>;

  saveAfter(events: E[], offset: tools.Duration): Promise<unknown>;
};
