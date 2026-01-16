import type { z } from "zod/v4";
import type { NodeEnvironmentType } from "../src/node-env.vo";

export type EnvironmentResultType<Schema> = z.infer<Schema> & { type: NodeEnvironmentType };

export interface EnvironmentLoaderPort<Schema extends z.ZodObject<any>> {
  load(): Promise<Readonly<EnvironmentResultType<Schema>>>;
}
