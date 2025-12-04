import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { FileDraft } from "../src/file-draft.service";

class AlphabetFile extends FileDraft {
  constructor() {
    super({ filename: "alphabet.txt", mime: tools.MIMES.text });
  }

  create() {
    return "abc";
  }
}

describe("FileDraft service", () => {
  test("getters", () => {
    const file = new AlphabetFile();

    expect(file.config.filename).toEqual("alphabet.txt");
    expect(file.config.mime.toString()).toEqual("text/plain");
    expect(file.getHeaders().get("content-type")).toEqual("text/plain");
    expect(file.getHeaders().get("content-disposition")).toEqual(`attachment; filename="alphabet.txt"`);
  });

  test("toResponse", async () => {
    const app = new Hono().get("/file", async () => new AlphabetFile().toResponse());

    const result = await app.request("/file");
    const text = await result.text();

    expect(result.status).toEqual(200);
    expect(text).toEqual("abc");
    expect(result.headers.get("content-type")).toEqual("text/plain");
    expect(result.headers.get("content-disposition")).toEqual(`attachment; filename="alphabet.txt"`);
  });

  test("toAttachment", async () => {
    expect(await new AlphabetFile().toAttachment()).toEqual({
      filename: "alphabet.txt",
      contentType: "text/plain",
      content: "abc",
    });
  });
});
