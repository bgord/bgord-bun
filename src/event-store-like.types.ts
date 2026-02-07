export type EventStoreLike<E extends { name: string }> = {
  save(events: ReadonlyArray<E>): Promise<unknown>;
};
