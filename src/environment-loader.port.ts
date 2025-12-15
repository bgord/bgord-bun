import type { z } from "zod/v4";
import type { NodeEnvironmentEnum } from "../src/node-env.vo";

export type EnvironmentResultType<Schema> = z.infer<Schema> & { type: NodeEnvironmentEnum };

export interface EnvironmentLoaderPort<Schema extends z.ZodObject<any>> {
  load(): Promise<Readonly<EnvironmentResultType<Schema>>>;
}
