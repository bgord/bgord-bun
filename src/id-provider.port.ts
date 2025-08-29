import type { UUIDType } from "./uuid.vo";

export interface IdProviderPort {
  generate(): UUIDType;
}
