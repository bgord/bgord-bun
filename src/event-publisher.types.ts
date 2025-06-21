export interface EventPublisher<EventMap extends Record<string, any>> {
  emit<Name extends keyof EventMap>(name: Name, payload: EventMap[Name]): Promise<void>;
}
