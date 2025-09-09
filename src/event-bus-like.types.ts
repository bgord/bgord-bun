import type { ToEventMap } from "./to-event-map.types";

export type EventBusLike<E extends { name: string }> = {
  on<K extends keyof ToEventMap<E> & string>(
    name: K,
    handler: (event: ToEventMap<E>[K]) => void | Promise<void>,
  ): void;
};

export type CommandBusLike<C extends { name: string }> = { emit(name: C["name"], command: C): Promise<void> };
