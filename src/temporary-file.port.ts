import type { PathType } from "./path.vo";

export interface TemporaryFilePort {
  write(file: File, filename: PathType): Promise<{ path: PathType }>;

  cleanup(path: PathType): Promise<void>;
}
