import { access, constants } from "node:fs/promises";
import type * as tools from "@bgord/tools";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export type PrerequisiteFilePermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteVerifierFileAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: {
      file: tools.FilePathAbsolute | tools.FilePathRelative;
      permissions?: PrerequisiteFilePermissionsType;
    },
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const path = this.config.file.get();

      const exists = await Bun.file(path).exists();
      if (!exists) return PrerequisiteVerification.failure({ message: "File does not exist" });

      const permissions = this.config.permissions ?? {};

      if (permissions.read) {
        try {
          await access(path, constants.R_OK);
        } catch {
          return PrerequisiteVerification.failure({ message: "File is not readable" });
        }
      }

      if (permissions.write) {
        try {
          await access(path, constants.W_OK);
        } catch {
          return PrerequisiteVerification.failure({ message: "File is not writable" });
        }
      }

      if (permissions.execute) {
        try {
          await access(path, constants.X_OK);
        } catch {
          return PrerequisiteVerification.failure({ message: "File is not executable" });
        }
      }

      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "file";
  }
}
