import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { RemoteFileStorageNoopAdapter } from "../src/remote-file-storage-noop.adapter";
import * as mocks from "./mocks";
import * as testcase from "./testcases";

const cases = testcase.remoteFileStorage();

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const adapter = new RemoteFileStorageNoopAdapter({ root: cases.subjects.root }, { Clock });

describe("RemoteFileStorageNoopAdapter", () => {
  test(cases.putFromPath.name, async () => {
    const output = await adapter.putFromPath({ key: cases.subjects.key, path: cases.subjects.source });

    expect(output.etag.matches(mocks.hash)).toEqual(true);
    expect(output.size.toBytes()).toEqual(v.parse(tools.SizeBytes, 10));
    expect(output.lastModified).toEqual(mocks.TIME_ZERO);
    expect(output.mime).toEqual(tools.Mimes.text.mime);
  });

  test(cases.headMissing.name, async () => {
    const result = await adapter.head(cases.subjects.key);

    expect(result.exists).toEqual(false);
  });

  test(cases.getStreamNull.name, async () => {
    expect(await adapter.getStream(cases.subjects.key)).toEqual(null);
  });

  test(cases.delete.name, async () => {
    expect(await adapter.delete(cases.subjects.key)).toEqual(cases.subjects.key);
  });

  test(cases.root.name, () => {
    expect(adapter.root).toEqual(cases.subjects.root);
  });
});
