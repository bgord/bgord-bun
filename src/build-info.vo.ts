import * as tools from "@bgord/tools";
import * as v from "valibot";
import { CommitShaValue } from "./commit-sha-value.vo";

export const BuildInfo = v.object({
  timestamp: tools.TimestampValue,
  version: tools.PackageVersionSchema,
  sha: CommitShaValue,
  size: tools.SizeBytes,
});

export type BuildInfoType = v.InferOutput<typeof BuildInfo>;

export const BUILD_INFO_FILE_PATH = tools.FilePathRelative.fromString("infra/build-info.json");
