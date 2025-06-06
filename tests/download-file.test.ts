import { expect, test } from "bun:test";
import * as tools from "@bgord/tools";

import { DownloadFile } from "../src/download-file";

test("DownloadFile.attach returns correct headers", () => {
  const config = {
    filename: "example.txt",
    mime: new tools.Mime("text/plain"),
  };

  const response = DownloadFile.attach(config);

  expect(response.headers).toBeInstanceOf(Headers);
  expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="example.txt"');
  expect(response.headers.get("Content-Type")).toBe("text/plain");
});
