import * as bgn from "@bgord/node";
import type { PathLike } from "node:fs";

export type DownloadFileConfigType = { filename: PathLike; mime: bgn.Mime };

export class DownloadFile {
  static attach(config: DownloadFileConfigType) {
    return {
      headers: new Headers({
        "Content-Disposition": `attachment; filename="${config.filename}"`,
        "Content-Type": config.mime.raw,
      }),
    };
  }
}
