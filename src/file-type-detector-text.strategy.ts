import type * as tools from "@bgord/tools";
import type { FileTypeDetectorStrategy } from "./file-type-detector.strategy";

const ALLOWED_CONTROL_BYTES = [0x09, 0x0a, 0x0c, 0x0d];

const isControlByte = (byte: number) =>
  (byte < 0x20 && !ALLOWED_CONTROL_BYTES.includes(byte)) || byte === 0x7f;

export class FileTypeDetectorTextStrategy implements FileTypeDetectorStrategy {
  constructor(private readonly mime: tools.Mime) {}

  detect(bytes: Uint8Array): tools.Mime | null {
    if (bytes.length === 0) return null;
    if (bytes.some(isControlByte)) return null;

    const text = new TextDecoder().decode(bytes);

    if (text.includes("\ufffd")) return null;
    if (text.trimStart().startsWith("<")) return null;

    return this.mime;
  }
}
