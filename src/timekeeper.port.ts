import type * as tools from "@bgord/tools";

export interface TimekeeperPort {
  get(signal?: AbortSignal): Promise<tools.Timestamp | null>;
}
