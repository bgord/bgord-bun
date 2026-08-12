import type * as tools from "@bgord/tools";
import type { CorrelationIdType } from "./correlation-id.vo";
import type { UUIDType } from "./uuid.vo";

export type GenericJob = {
  id: UUIDType;
  correlationId: CorrelationIdType;
  createdAt: number;
  name: string;
  revision: tools.RevisionValueType;
  payload: Record<string, unknown>;
};

export type GenericJobSerialized = Omit<GenericJob, "payload"> & { payload: string };
