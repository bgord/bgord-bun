import * as v from "valibot";

export const EventStreamError = {
  Type: "event.stream.type",
  Empty: "event.stream.empty",
  TooLong: "event.stream.too.long",
};

export const EventStream = v.pipe(
  v.string(EventStreamError.Type),
  v.minLength(1, EventStreamError.Empty),
  v.maxLength(256, EventStreamError.TooLong),
);

export type EventStreamType = v.InferOutput<typeof EventStream>;
