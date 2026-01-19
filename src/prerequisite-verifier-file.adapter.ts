import { access, constants } from "node:fs/promises";
import type * as tools from "@bgord/tools";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export type PrerequisiteFilePermissionsType = { read?: boolean; write?: boolean; execute?: boolean };

export class PrerequisiteVerifierFileAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: {
      file: tools.FilePathAbsolute | tools.FilePathRelative;
      permissions?: PrerequisiteFilePermissionsType;
    },
  ) {}

  async verify() {
    try {
      const path = this.config.file.get();

      const exists = await Bun.file(path).exists();

      if (!exists) return PrerequisiteVerification.failure("File does not exist");

      const permissions = this.config.permissions ?? {};

      const checks = [
        { enabled: permissions.read, mode: constants.R_OK, error: "File is not readable" },
        { enabled: permissions.write, mode: constants.W_OK, error: "File is not writable" },
        { enabled: permissions.execute, mode: constants.X_OK, error: "File is not executable" },
      ];

      for (const check of checks) {
        if (!check.enabled) continue;

        try {
          await access(this.config.file.get(), check.mode);
        } catch {
          return PrerequisiteVerification.failure(check.error);
        }
      }

      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind() {
    return "file";
  }
}
