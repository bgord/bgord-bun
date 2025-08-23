export type EventStoreLike<E extends { name: string }> = {
  save(events: E[]): Promise<unknown>;
  saveAfter(events: E[], delay: { ms: number }): Promise<unknown>;
};
