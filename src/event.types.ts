import type * as tools from "@bgord/tools";
import type { CommitShaValueType } from "./commit-sha-value.vo";
import type { CorrelationIdType } from "./correlation-id.vo";
import type { EventStreamType } from "./event-stream.vo";
import type { UUIDType } from "./uuid.vo";

export type GenericEvent = {
  id: UUIDType;
  correlationId: CorrelationIdType;
  createdAt: number;
  stream: EventStreamType;
  revision?: tools.RevisionValueType;
  commit: CommitShaValueType;
  name: string;
  version: number;
  payload: Record<string, unknown>;
};

export type GenericEventSerialized = Omit<GenericEvent, "payload"> & { payload: string };
