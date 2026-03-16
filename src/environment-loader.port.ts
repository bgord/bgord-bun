import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { NodeEnvironmentEnum } from "../src/node-env.vo";

export const EnvironmentLoaderError = { NoAsyncSchema: "environment.loader.no.async.schema" };

export type EnvironmentLoaderConfig<T extends object> = {
  type: NodeEnvironmentEnum;
  EnvironmentSchema: StandardSchemaV1<unknown, T>;
};

export type EnvironmentResultType<T extends object> = T & { type: NodeEnvironmentEnum };

export interface EnvironmentLoaderPort<T extends object> {
  load(): Promise<Readonly<EnvironmentResultType<T>>>;
}
