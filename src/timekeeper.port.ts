import type * as tools from "@bgord/tools";

export interface TimekeeperPort {
  get(): Promise<tools.Timestamp>;
}
