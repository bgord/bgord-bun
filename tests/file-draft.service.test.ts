import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { FileDraft } from "../src/file-draft.service";

class AlphabetFile extends FileDraft {
  constructor() {
    super({ filename: "alphabet.txt", mime: new tools.Mime("text/plain") });
  }

  create() {
    return "abc";
  }
}

describe("FileDraft", () => {
  test("getters", () => {
    const file = new AlphabetFile();
    expect(file.config.filename).toEqual("alphabet.txt");
    expect(file.config.mime.raw).toEqual("text/plain");
    expect(file.getHeaders().get("content-type")).toEqual("text/plain");
    expect(file.getHeaders().get("content-disposition")).toEqual(`attachment; filename="alphabet.txt"`);
  });

  test("toResponse", async () => {
    const app = new Hono();
    app.get("/file", async () => new AlphabetFile().toResponse());

    const result = await app.request("/file");
    expect(result.status).toEqual(200);

    const text = await result.text();
    expect(text).toEqual("abc");
    expect(result.headers.get("content-type")).toEqual("text/plain");
    expect(result.headers.get("content-disposition")).toEqual(`attachment; filename="alphabet.txt"`);
  });

  test("toAttachment", async () => {
    const attachment = await new AlphabetFile().toAttachment();

    expect(attachment).toEqual({ filename: "alphabet.txt", contentType: "text/plain", content: "abc" });
  });
});
