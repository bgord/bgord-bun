import { expect, test } from "bun:test";

import { Gzip } from "../src/gzip";

const inputFilePath = "tests/tmp/test-input.txt";
const compressedFilePath = "tests/tmp/test-compressed.gz";
const decompressedFilePath = "tests/tmp/test-decompressed.txt";

async function checkFileContent(filePath: string, expectedContent: string) {
  const content = await Bun.file(filePath).text();
  expect(content).toBe(expectedContent);
}

async function cleanUpFiles() {
  await Bun.file(inputFilePath)
    .unlink()
    .catch(() => {});
  await Bun.file(compressedFilePath)
    .unlink()
    .catch(() => {});
  await Bun.file(decompressedFilePath)
    .unlink()
    .catch(() => {});
}

test("Gzip.compress compresses a file correctly", async () => {
  const content = "This is a test file content for compression!";
  await Bun.file(inputFilePath).write(content);

  await Gzip.compress({
    input: inputFilePath,
    output: compressedFilePath,
  });

  const compressedContent = await Bun.file(compressedFilePath).text();
  expect(compressedContent).not.toBe(content);

  await cleanUpFiles();
});

test("Gzip.uncompress decompresses a file correctly", async () => {
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

  await cleanUpFiles();
});

test("Gzip.compress and Gzip.uncompress work together", async () => {
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

  await cleanUpFiles();
});
