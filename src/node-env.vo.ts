import { z } from "zod/v4";

export const NodeEnvironmentValues = ["local", "test", "staging", "production"] as const;

export type NodeEnvironmentType = (typeof NodeEnvironmentValues)[number];

export enum NodeEnvironmentEnum {
  local = "local",
  test = "test",
  staging = "staging",
  production = "production",
}

export const NodeEnvironment = z.enum(NodeEnvironmentValues, { message: "node.environment.invalid" });
