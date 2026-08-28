import * as tools from "@bgord/tools";
import * as v from "valibot";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SubjectApplicationResolver } from "../src/subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "../src/subject-segment-fixed.strategy";
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

export const cacheRepository = async () => {
  const HashContent = new HashContentSha256Strategy();

  const primary = await new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("key")], {
    HashContent,
  }).resolve();
  const other = await new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("other")], {
    HashContent,
  }).resolve();

  return {
    subjects: { primary: primary.hex, other: other.hex },
    getNull: { name: "get - null", output: null },
    getValue: { name: "get - value", input: "value", output: "value" },
    getCopy: { name: "get - copy", input: { nested: { count: 1 } }, output: { nested: { count: 1 } } },
    getNoMutationLeak: { name: "get - no mutation leak", input: { nested: { count: 1 } } },
    getOtherSubject: { name: "get - other subject", input: "value", output: null },
    setOverwrite: { name: "set - overwrite", input: { first: "first", second: "second" }, output: "second" },
    setFailure: { name: "set - failure", input: "value", output: null },
    delete: { name: "delete", input: "value", output: null },
    deleteFailure: { name: "delete - failure", input: "value" },
    flush: { name: "flush", input: "value", output: null },
    ttlFinite: { name: "ttl - finite", input: "value", output: null },
    ttlInfinite: { name: "ttl - infinite", input: "value", output: "value" },
    roundTrips: [
      { name: "round trip - string", input: "value", output: "value" },
      { name: "round trip - number", input: 42, output: 42 },
      { name: "round trip - boolean", input: false, output: false },
      { name: "round trip - array", input: [1, "two", null], output: [1, "two", null] },
      { name: "round trip - object", input: { nested: { count: 1 } }, output: { nested: { count: 1 } } },
      { name: "round trip - empty array", input: [], output: [] },
      { name: "round trip - empty object", input: {}, output: {} },
      { name: "round trip - absent field", input: { present: 1, absent: undefined }, output: { present: 1 } },
    ],
  } as const;
};

export const remoteFileStorage = () => {
  const root = v.parse(tools.DirectoryPathAbsoluteSchema, "/root");
  const key = v.parse(tools.ObjectKey, "users/1/avatar.webp");
  const source = tools.FilePathAbsolute.fromString("/tmp/upload/avatar.webp");
  const stream = new ReadableStream();

  const stored = {
    etag: mocks.hash,
    size: tools.Size.fromBytes(1000),
    lastModified: mocks.TIME_ZERO,
    mime: tools.Mimes.text.mime,
  };

  return {
    subjects: {
      root,
      key,
      source,
      stream,
      stored,
      directory: `${root}/users/1`,
      final: tools.FilePathAbsolute.fromString(`${root}/users/1/avatar.webp`),
      temporary: tools.FilePathAbsolute.fromString(`${root}/users/1/avatar-part-${mocks.nonce}.webp`),
    },
    putFromPath: { name: "putFromPath", input: { key, path: source }, output: stored },
    putFromPathFailure: {
      name: "putFromPath - failure",
      input: { key, path: source },
      output: mocks.IntentionalError,
    },
    head: { name: "head", input: key, output: { exists: true, ...stored } },
    headMissing: { name: "head - missing", input: key, output: { exists: false } },
    headFailure: { name: "head - failure", input: key, output: mocks.IntentionalError },
    getStream: { name: "getStream", input: key, output: stream },
    getStreamNull: { name: "getStream - null", input: key, output: null },
    getStreamFailure: { name: "getStream - failure", input: key, output: mocks.IntentionalError },
    delete: { name: "delete", input: key, output: key },
    deleteFailure: { name: "delete - failure", input: key, output: mocks.IntentionalError },
    root: { name: "get root", output: root },
  } as const;
};
