export type EventStoreLike<E extends { name: string }> = {
  save(events: E[]): Promise<unknown>;
};
