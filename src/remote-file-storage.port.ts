import type * as tools from "@bgord/tools";

export type RemotePutFromPathInput = {
  key: tools.ObjectKeyType;
  path: tools.FilePathRelative | tools.FilePathAbsolute;
  mime: tools.Mime;
  cacheControl?: string;
};

export type RemotePutFromPathResult = {
  etag: string;
  bytes: number;
  lastModified: Date;
};

export type RemoteHeadResult =
  | { exists: false }
  | { exists: true; etag: string; bytes: number; lastModified: Date; mime?: tools.Mime };

export interface RemoteFileStoragePort {
  putFromPath(input: RemotePutFromPathInput): Promise<RemotePutFromPathResult>;
  head(input: { key: tools.ObjectKeyType }): Promise<RemoteHeadResult>;
  getStream(input: { key: tools.ObjectKeyType }): Promise<ReadableStream | null>;
  delete(input: { key: tools.ObjectKeyType }): Promise<void>;
  publicUrl(input: { key: tools.ObjectKeyType }): string;
}
