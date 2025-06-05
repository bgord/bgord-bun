import { PathLike, createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGunzip, createGzip } from "node:zlib";

type GzipCompressConfigType = { input: PathLike; output: PathLike };

export class Gzip {
  static createCompress() {
    return createGzip();
  }

  static createDecompress() {
    return createGunzip();
  }

  static async compress(config: GzipCompressConfigType) {
    return pipeline(createReadStream(config.input), createGzip(), createWriteStream(config.output));
  }

  static async uncompress(config: GzipCompressConfigType) {
    return pipeline(createReadStream(config.input), createGunzip(), createWriteStream(config.output));
  }
}
