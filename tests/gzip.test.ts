import { describe, expect, test } from "bun:test";
import { Gzip } from "../release-candidates";

const inputFilePath = "tests/tmp/test-input.txt";
const compressedFilePath = "tests/tmp/test-compressed.gz";
const decompressedFilePath = "tests/tmp/test-decompressed.txt";

describe.skip("gzip", () => {
  test("compress", async () => {
    const content = "This is a test file content for compression!";
    await Bun.file(inputFilePath).write(content);

    await Gzip.compress({
      input: inputFilePath,
      output: compressedFilePath,
    });

    const compressedContent = await Bun.file(compressedFilePath).text();
    expect(compressedContent).not.toEqual(content);

    await Bun.file(inputFilePath).unlink();
    await Bun.file(compressedFilePath).unlink();
  });

  test("uncompress", async () => {
    const content = "This is a test file content for decompression!";
    await Bun.file(inputFilePath).write(content);

    await Gzip.compress({
      input: inputFilePath,
      output: compressedFilePath,
    });

    await Gzip.uncompress({
      input: compressedFilePath,
      output: decompressedFilePath,
    });

    await checkFileContent(decompressedFilePath, content);

    await Bun.file(inputFilePath).unlink();
    await Bun.file(compressedFilePath).unlink();
    await Bun.file(decompressedFilePath).unlink();
  });

  test("compress and uncompress", async () => {
    const originalContent = "This is the original content to compress and decompress!";
    await Bun.file(inputFilePath).write(originalContent);

    await Gzip.compress({
      input: inputFilePath,
      output: compressedFilePath,
    });

    await Gzip.uncompress({
      input: compressedFilePath,
      output: decompressedFilePath,
    });

    await checkFileContent(decompressedFilePath, originalContent);

    await Bun.file(inputFilePath).unlink();
    await Bun.file(compressedFilePath).unlink();
    await Bun.file(decompressedFilePath).unlink();
  });
});

async function checkFileContent(path: string, expectedContent: string) {
  expect(await Bun.file(path).text()).toEqual(expectedContent);
}
