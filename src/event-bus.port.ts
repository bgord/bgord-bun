import type { ToEventMap } from "./to-event-map.types";

export interface EventBusPort<E extends { name: string }> {
  emit<K extends keyof ToEventMap<E>>(name: K, event: ToEventMap<E>[K]): Promise<void>;

  on<K extends keyof ToEventMap<E>>(
    name: K,
    handler: (event: ToEventMap<E>[K]) => void | Promise<void>,
  ): void;
}
