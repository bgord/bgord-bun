import { describe, expect, spyOn, test } from "bun:test";
import * as sslChecker from "ssl-checker";
import { PrerequisiteSSLCertificateExpiry } from "../src/prerequisites/ssl-certificate-expiry";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

describe("prerequisites - ssl certificate expiry", () => {
  test("passes when certificate is valid and has enough days remaining", async () => {
    // @ts-expect-error
    spyOn(sslChecker, "default").mockImplementation(async () => ({ valid: true, daysRemaining: 100 }));

    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl-certificate",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.success);
  });

  test("fails when certificate is valid but expires too soon", async () => {
    // @ts-expect-error
    spyOn(sslChecker, "default").mockImplementation(async () => ({ valid: true, daysRemaining: 10 }));

    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl-certificate",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);
  });

  test("fails when certificate is invalid", async () => {
    // @ts-expect-error
    spyOn(sslChecker, "default").mockImplementation(async () => ({ valid: false, daysRemaining: 0 }));

    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl-certificate",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);
  });

  test("fails when sslChecker throws", async () => {
    spyOn(sslChecker, "default").mockRejectedValue(new Error("SSL check failed"));

    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl-certificate",
      enabled: true,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.failure);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl-certificate",
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
