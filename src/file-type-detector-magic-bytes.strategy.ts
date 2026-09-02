import * as tools from "@bgord/tools";
import type { FileTypeDetectorStrategy } from "./file-type-detector.strategy";

type Signature = { mime: tools.Mime; offset: number; bytes: ReadonlyArray<number> };

const ASCII = (value: string): ReadonlyArray<number> => [...value].map((char) => char.charCodeAt(0));

const SIGNATURES: ReadonlyArray<Signature> = [
  { mime: tools.Mimes.png.mime, offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: tools.Mimes.webp.mime, offset: 8, bytes: ASCII("WEBP") },
  { mime: tools.Mimes.wav.mime, offset: 8, bytes: ASCII("WAVE") },
  { mime: tools.Mimes.mp4.mime, offset: 4, bytes: ASCII("ftyp") },
  { mime: tools.Mimes.pdf.mime, offset: 0, bytes: ASCII("%PDF-") },
  { mime: tools.Mimes.zip.mime, offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] },
  { mime: tools.Mimes.jpg.mime, offset: 0, bytes: [0xff, 0xd8, 0xff] },
  { mime: tools.Mimes.tar.mime, offset: 0, bytes: [0x1f, 0x8b] },
];

export class FileTypeDetectorMagicBytesStrategy implements FileTypeDetectorStrategy {
  detect(bytes: Uint8Array): tools.Mime | null {
    for (const signature of SIGNATURES) {
      if (bytes.length < signature.offset + signature.bytes.length) continue;

      if (signature.bytes.every((byte, index) => bytes[signature.offset + index] === byte)) {
        return signature.mime;
      }
    }

    return null;
  }
}
