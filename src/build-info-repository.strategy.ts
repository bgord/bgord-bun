import * as tools from "@bgord/tools";
import * as v from "valibot";
import { CommitShaValue } from "./commit-sha-value.vo";

export const BuildInfoSchema = v.object({
  timestamp: tools.TimestampValue,
  version: tools.PackageVersionSchema,
  sha: CommitShaValue,
  size: tools.SizeBytes,
});

export type BuildInfoType = v.InferOutput<typeof BuildInfoSchema>;

export const BUILD_INFO_FILE_PATH = tools.FilePathRelative.fromString("infra/build-info.json");
