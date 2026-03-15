import type { EventSerializerPort } from "./event-serializer.port";

export class EventSerializerJsonAdapter implements EventSerializerPort {
  serialize(payload: unknown): string {
    return JSON.stringify(payload);
  }

  deserialize(raw: string): unknown {
    return JSON.parse(raw);
  }
}
