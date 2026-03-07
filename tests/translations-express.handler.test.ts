import { describe, expect, test } from "bun:test";
import cookieParser from "cookie-parser";
import express, { type NextFunction, type Request, type Response } from "express";
import request from "supertest";
import { FileReaderJsonNoopAdapter } from "../src/file-reader-json-noop.adapter";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { TranslationsExpressHandler } from "../src/translations-express.handler";

enum SupportedLanguages {
  en = "en",
  pl = "pl",
}

const Logger = new LoggerNoopAdapter();
const FileReaderJson = new FileReaderJsonNoopAdapter({ hello: "Hello" });
const deps = { FileReaderJson, Logger };

// TODO
// Simple language detector middleware for Express
const languageDetectorMiddleware = (supportedLanguages: Array<string>, fallback: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const cookieLanguage = req.cookies?.language;
    req.language = supportedLanguages.includes(cookieLanguage) ? cookieLanguage : fallback;
    next();
  };
};

const app = express()
  .use(cookieParser())
  .use(languageDetectorMiddleware(Object.keys(SupportedLanguages), SupportedLanguages.en))
  .get("/get-translations", new TranslationsExpressHandler(SupportedLanguages, deps).handle());

describe("TranslationsExpressHandler", () => {
  test("happy path - no language specified", async () => {
    const response = await request(app).get("/get-translations");

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: SupportedLanguages,
    });
  });

  test("happy path - en", async () => {
    const response = await request(app)
      .get("/get-translations")
      .set("cookie", `language=${SupportedLanguages.en}`);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: SupportedLanguages,
    });
  });

  test("happy path - pl", async () => {
    const response = await request(app)
      .get("/get-translations")
      .set("cookie", `language=${SupportedLanguages.pl}`);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      translations: { hello: "Hello" },
      language: "pl",
      supportedLanguages: SupportedLanguages,
    });
  });

  test("happy path - other", async () => {
    const response = await request(app).get("/get-translations").set("cookie", "language=fr");

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      translations: { hello: "Hello" },
      language: "en",
      supportedLanguages: SupportedLanguages,
    });
  });
});
