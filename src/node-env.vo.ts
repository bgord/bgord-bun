import { z } from "zod/v4";

export enum NodeEnvironmentEnum {
  local = "local",
  test = "test",
  staging = "staging",
  production = "production",
}

export const NodeEnvironmentError = { Invalid: "node.environment.invalid" } as const;

export const NodeEnvironment = z.enum(NodeEnvironmentEnum, NodeEnvironmentError.Invalid);

export type NodeEnvironmentType = z.infer<typeof NodeEnvironment>;
