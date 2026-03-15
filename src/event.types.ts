import type * as tools from "@bgord/tools";
import type { EventStreamType } from "./event-stream.vo";
import type { UUIDType } from "./uuid.vo";

export type GenericEvent = {
  id: UUIDType;
  correlationId: UUIDType;
  createdAt: number;
  stream: EventStreamType;
  revision?: tools.RevisionValueType;
  name: string;
  version: number;
  payload: unknown;
};

export type GenericEventSerialized = Omit<GenericEvent, "payload"> & { payload: string };
