import type { NodeEnvironmentEnum } from "../src/node-env.vo";
import type { EnvironmentSchemaPort } from "./environment-schema.port";

export type EnvironmentLoaderConfig<T extends object> = {
  type: NodeEnvironmentEnum;
  EnvironmentSchema: EnvironmentSchemaPort<T>;
};
export type EnvironmentResultType<T extends object> = T & { type: NodeEnvironmentEnum };

export interface EnvironmentLoaderPort<T extends object> {
  load(): Promise<Readonly<EnvironmentResultType<T>>>;
}
