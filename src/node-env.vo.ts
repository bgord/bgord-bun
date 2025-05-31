import { z } from "zod/v4";

export enum NodeEnvironmentEnum {
  local = "local",
  test = "test",
  staging = "staging",
  production = "production",
}
export const NodeEnvironment = z.enum(NodeEnvironmentEnum);
