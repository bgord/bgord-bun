import type * as tools from "@bgord/tools";
import type { FileHashResult } from "./file-hash.port";

export type RemotePutFromPathInput = {
  key: tools.ObjectKeyType;
  path: tools.FilePathRelative | tools.FilePathAbsolute;
};
export type RemotePutFromPathResult = FileHashResult;
export type RemoteHeadResult = { exists: false } | ({ exists: true } & FileHashResult);

export interface RemoteFileStoragePort {
  putFromPath(input: RemotePutFromPathInput): Promise<RemotePutFromPathResult>;
  head(key: tools.ObjectKeyType): Promise<RemoteHeadResult>;
  getStream(key: tools.ObjectKeyType): Promise<ReadableStream | null>;
  delete(key: tools.ObjectKeyType): Promise<void>;
  get root(): tools.DirectoryPathAbsoluteType;
}
