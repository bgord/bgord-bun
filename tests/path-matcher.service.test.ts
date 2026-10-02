import { describe, expect, test } from "bun:test";
import { PathMatcher } from "../src/path-matcher.service";

describe("PathMatcher", () => {
  test("matches - exact", () => {
    expect(PathMatcher.matches(["/api"], "/api")).toEqual(true);
  });

  test("matches - nested segment", () => {
    expect(PathMatcher.matches(["/api"], "/api/users")).toEqual(true);
  });

  test("matches - trailing slash rule", () => {
    expect(PathMatcher.matches(["/i18n/"], "/i18n/en.json")).toEqual(true);
  });

  test("matches - trailing slash rule - exact", () => {
    expect(PathMatcher.matches(["/i18n/"], "/i18n/")).toEqual(true);
  });

  test("matches - root rule", () => {
    expect(PathMatcher.matches(["/"], "/users")).toEqual(true);
  });

  test("matches - url pattern", () => {
    const rules = [new URLPattern({ pathname: "/users/:id/account" })];

    expect(PathMatcher.matches(rules, "/users/1/account")).toEqual(true);
  });

  test("matches - any rule", () => {
    expect(PathMatcher.matches(["/other", "/api"], "/api/users")).toEqual(true);
  });

  test("matches - segment boundary", () => {
    expect(PathMatcher.matches(["/api"], "/apiary")).toEqual(false);
  });

  test("matches - trailing slash rule - without slash", () => {
    expect(PathMatcher.matches(["/i18n/"], "/i18n")).toEqual(false);
  });

  test("matches - other path", () => {
    expect(PathMatcher.matches(["/api"], "/ping")).toEqual(false);
  });

  test("matches - url pattern - other path", () => {
    const rules = [new URLPattern({ pathname: "/users/:id/account" })];

    expect(PathMatcher.matches(rules, "/users/1")).toEqual(false);
  });

  test("matches - no rules", () => {
    expect(PathMatcher.matches([], "/api")).toEqual(false);
  });

  test("matches - undefined rules", () => {
    expect(PathMatcher.matches(undefined, "/api")).toEqual(false);
  });
});
