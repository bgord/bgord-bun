import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import * as Auth from "../src/modules/auth";
import * as mocks from "./mocks";

describe("Auth.VO.UserId", () => {
  test("happy path", () => {
    expect(v.safeParse(Auth.VO.UserId, mocks.userId).success).toEqual(true);
  });

  test("rejects invalid", () => {
    expect(() => v.parse(Auth.VO.UserId, "not-a-uuid")).toThrow("uuid.type");
  });
});
