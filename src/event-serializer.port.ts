import type { GenericEvent, GenericEventSerialized } from "./event.types";

export interface EventSerializerPort {
  serialize(payload: GenericEvent["payload"]): GenericEventSerialized["payload"];
  deserialize(raw: GenericEventSerialized["payload"]): GenericEvent["payload"];
}
