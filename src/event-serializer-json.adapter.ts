import type { GenericEvent, GenericEventSerialized } from "./event.types";
import type { EventSerializerPort } from "./event-serializer.port";

export class EventSerializerJsonAdapter implements EventSerializerPort {
  serialize(payload: GenericEvent["payload"]): GenericEventSerialized["payload"] {
    return JSON.stringify(payload);
  }

  deserialize(raw: GenericEventSerialized["payload"]): GenericEvent["payload"] {
    return JSON.parse(raw);
  }
}
