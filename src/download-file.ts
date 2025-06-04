import type { PathLike } from "node:fs";
import * as tools from "@bgord/tools";

type DownloadFileConfigType = { filename: PathLike; mime: tools.Mime };

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
