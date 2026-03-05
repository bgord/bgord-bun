import type { ToEventMap } from "./to-event-map.types";

export interface CommandBusPort<C extends { name: string }> {
  emit<K extends keyof ToEventMap<C>>(name: K, command: ToEventMap<C>[K]): Promise<void>;

  on<K extends keyof ToEventMap<C>>(
    name: K,
    handler: (command: ToEventMap<C>[K]) => void | Promise<void>,
  ): void;
}
