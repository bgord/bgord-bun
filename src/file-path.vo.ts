import { DirectoryPathAbsoluteSchema, type DirectoryPathAbsoluteType } from "./directory-path-absolute.vo";
import { DirectoryPathRelativeSchema, type DirectoryPathRelativeType } from "./directory-path-relative.vo";
import type { Filename } from "./filename.vo";

export class RelativeFilePath {
  private constructor(
    private readonly directory: DirectoryPathRelativeType,
    private readonly filename: Filename,
  ) {}

  static fromParts(directoryCandidate: string, filename: Filename) {
    const directory = DirectoryPathRelativeSchema.parse(directoryCandidate);
    return new RelativeFilePath(directory, filename);
  }

  static fromPartsSafe(directory: DirectoryPathRelativeType, filename: Filename) {
    return new RelativeFilePath(directory, filename);
  }

  get() {
    return `${this.directory}/${this.filename.get()}`;
  }

  getDirectory(): DirectoryPathRelativeType {
    return this.directory;
  }

  getFilename(): Filename {
    return this.filename;
  }

  withDirectoryRelative(newDirectory: DirectoryPathRelativeType): RelativeFilePath {
    return new RelativeFilePath(newDirectory, this.filename);
  }

  withFilename(newFilename: Filename): RelativeFilePath {
    return new RelativeFilePath(this.directory, newFilename);
  }

  toAbsolute(newDirectory: DirectoryPathAbsoluteType): AbsoluteFilePath {
    return AbsoluteFilePath.fromPartsSafe(newDirectory, this.filename);
  }
}

export class AbsoluteFilePath {
  private constructor(
    private readonly directory: DirectoryPathAbsoluteType,
    private readonly filename: Filename,
  ) {}

  static fromParts(directoryCandidate: string, filename: Filename) {
    const directory = DirectoryPathAbsoluteSchema.parse(directoryCandidate);
    return new AbsoluteFilePath(directory, filename);
  }

  static fromPartsSafe(directory: DirectoryPathAbsoluteType, filename: Filename) {
    return new AbsoluteFilePath(directory, filename);
  }

  get() {
    if (this.directory === ("/" as DirectoryPathAbsoluteType)) return `/${this.filename.get()}`;
    return `${this.directory}/${this.filename.get()}`;
  }

  getDirectory(): DirectoryPathAbsoluteType {
    return this.directory;
  }

  getFilename(): Filename {
    return this.filename;
  }

  withDirectoryAbsolute(newDirectory: DirectoryPathAbsoluteType): AbsoluteFilePath {
    return new AbsoluteFilePath(newDirectory, this.filename);
  }

  withFilename(newFilename: Filename): AbsoluteFilePath {
    return new AbsoluteFilePath(this.directory, newFilename);
  }

  toRelative(newDirectory: DirectoryPathRelativeType): RelativeFilePath {
    return RelativeFilePath.fromPartsSafe(newDirectory, this.filename);
  }
}
