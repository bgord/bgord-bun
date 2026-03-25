import type { GenericEvent, GenericEventSerialized } from "./event.types";
import type { EventSerializerPort } from "./event-serializer.port";

export class EventSerializerCollectingAdapter implements EventSerializerPort {
  readonly serialized: Array<GenericEvent["payload"]> = [];

  readonly deserialized: Array<GenericEventSerialized["payload"]> = [];

  serialize(payload: GenericEvent["payload"]): GenericEventSerialized["payload"] {
    this.serialized.push(payload);

    return JSON.stringify(payload);
  }

  deserialize(raw: GenericEventSerialized["payload"]): GenericEvent["payload"] {
    this.deserialized.push(raw);

    return JSON.parse(raw);
  }
}
