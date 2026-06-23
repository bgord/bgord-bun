import * as tools from "@bgord/tools";
import * as mocks from "./mocks";

export const images = {
  in_place: {
    // jpeg
    absolute: {
      input: tools.FilePathAbsolute.fromString("/var/img/photo.jpeg"),
      temporary: (suffix: string) =>
        tools.FilePathAbsolute.fromString(`/var/img/photo-${suffix}-${mocks.nonce}.jpeg`),
    },
    // png
    relative: {
      input: tools.FilePathRelative.fromString("var/img/photo.png"),
      temporary: (suffix: string) =>
        tools.FilePathRelative.fromString(`var/img/photo-${suffix}-${mocks.nonce}.png`),
    },
  },
  output_path: {
    // png -> webp
    absolute: {
      input: tools.FilePathAbsolute.fromString("/var/img/photo.png"),
      output: tools.FilePathAbsolute.fromString("/var/img/result.webp"),
      temporary: (suffix: string) =>
        tools.FilePathAbsolute.fromString(`/var/img/result-${suffix}-${mocks.nonce}.webp`),
    },
    // webp -> png
    relative: {
      input: tools.FilePathRelative.fromString("var/img/photo.webp"),
      output: tools.FilePathRelative.fromString("var/img/result.png"),
      temporary: (suffix: string) =>
        tools.FilePathRelative.fromString(`var/img/result-${suffix}-${mocks.nonce}.png`),
    },
  },
  jpg_to_jpeg: {
    input: tools.FilePathAbsolute.fromString("/var/img/photo.jpg"),
    temporary: (suffix: string) =>
      tools.FilePathAbsolute.fromString(`/var/img/photo-${suffix}-${mocks.nonce}.jpg`),
  },
};
