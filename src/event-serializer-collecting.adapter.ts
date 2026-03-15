import type { EventSerializerPort } from "./event-serializer.port";

export class EventSerializerCollectingAdapter implements EventSerializerPort {
  readonly serialized: Array<unknown> = [];
  readonly deserialized: Array<string> = [];

  serialize(payload: unknown): string {
    this.serialized.push(payload);
    return JSON.stringify(payload);
  }

  deserialize(raw: string): unknown {
    this.deserialized.push(raw);
    return JSON.parse(raw);
  }
}
