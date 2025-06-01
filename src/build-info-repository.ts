import * as tools from "@bgord/tools";
import { z } from "zod/v4";

export const BuildVersionSchema = z.string().min(1).max(128);
export type BuildVersionSchemaType = z.infer<typeof BuildVersionSchema>;

export type BuildInfoType = {
  BUILD_DATE: tools.TimestampType;
  BUILD_VERSION?: BuildVersionSchemaType;
};

// TODO: add test
export class BuildInfoRepository {
  static async extract(): Promise<BuildInfoType> {
    const BUILD_DATE = Date.now();

    try {
      const packageJson = await Bun.file("package.json").json();

      const BUILD_VERSION = BuildVersionSchema.parse(packageJson.version);

      return { BUILD_DATE, BUILD_VERSION };
    } catch (error) {
      return { BUILD_DATE };
    }
  }
}
