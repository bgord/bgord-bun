import type * as tools from "@bgord/tools";
import type { UUIDType } from "./uuid.vo";

export type GenericJob = {
  id: UUIDType;
  correlationId: UUIDType;
  createdAt: number;
  name: string;
  revision: tools.RevisionValueType;
  payload: Record<string, unknown>;
};

export type GenericJobSerialized = Omit<GenericJob, "payload"> & { payload: string };
