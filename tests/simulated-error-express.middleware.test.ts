import { describe, expect, test } from "bun:test";
import express, { type NextFunction, type Request, type Response } from "express";
import request from "supertest";
import { SimulatedErrorExpressMiddleware } from "../src/simulated-error-express.middleware";

describe("SimulatedErrorExpressMiddleware", () => {
  test("happy path", async () => {
    const app = express()
      .get("/simulated-error", new SimulatedErrorExpressMiddleware().handle())
      .use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
        if (error.message === "Simulated error") return response.status(418).send("caught");
        throw error;
      });

    const response = await request(app).get("/simulated-error");

    expect(response.status).toEqual(418);
    expect(response.text).toEqual("caught");
  });
});
