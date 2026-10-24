import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ProfileAvatarConstraints } from "../src/modules/preferences/invariants";
import * as mocks from "./mocks";

describe("ProfileAvatarConstraints", () => {
  test("passes", () => {
    const info = {
      width: v.parse(tools.ImageWidth, 4000),
      height: v.parse(tools.ImageHeight, 4000),
      mime: tools.Mimes.png.mime,
      size: tools.Size.fromMB(10),
    };

    expect(ProfileAvatarConstraints.passes({ info, ProfileAvatar: mocks.ProfileAvatar })).toEqual(true);
  });

  test("fails - maxSide - width", () => {
    const info = {
      width: v.parse(tools.ImageWidth, 4001),
      height: v.parse(tools.ImageHeight, 100),
      mime: tools.Mimes.png.mime,
      size: tools.Size.fromKb(100),
    };

    expect(ProfileAvatarConstraints.passes({ info, ProfileAvatar: mocks.ProfileAvatar })).toEqual(false);
  });

  test("fails - maxSide - height", () => {
    const info = {
      width: v.parse(tools.ImageWidth, 100),
      height: v.parse(tools.ImageHeight, 4001),
      mime: tools.Mimes.png.mime,
      size: tools.Size.fromKb(100),
    };

    expect(ProfileAvatarConstraints.passes({ info, ProfileAvatar: mocks.ProfileAvatar })).toEqual(false);
  });

  test("fails - size", () => {
    const info = {
      width: v.parse(tools.ImageWidth, 100),
      height: v.parse(tools.ImageHeight, 100),
      mime: tools.Mimes.png.mime,
      size: tools.Size.fromMB(11),
    };

    expect(ProfileAvatarConstraints.passes({ info, ProfileAvatar: mocks.ProfileAvatar })).toEqual(false);
  });

  test("fails - mime", () => {
    const info = {
      width: v.parse(tools.ImageWidth, 100),
      height: v.parse(tools.ImageHeight, 100),
      mime: tools.Mimes.text.mime,
      size: tools.Size.fromKb(100),
    };

    expect(ProfileAvatarConstraints.passes({ info, ProfileAvatar: mocks.ProfileAvatar })).toEqual(false);
  });

  test("message", () => {
    expect(ProfileAvatarConstraints.message).toEqual("profile.avatar.constraints");
  });
});
