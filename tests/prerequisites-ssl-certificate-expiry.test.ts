import { expect, spyOn, test } from "bun:test";
import * as sslChecker from "ssl-checker";
import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteSSLCertificateExpiry } from "../src/prerequisites/ssl-certificate-expiry";

test("passes when certificate is valid and has enough days remaining", async () => {
  const sslCheckerSpy = spyOn(sslChecker, "default").mockImplementation(
    // @ts-expect-error
    async () => ({
      valid: true,
      daysRemaining: 100,
    }),
  );

  const prerequisite = new PrerequisiteSSLCertificateExpiry({
    host: "example.com",
    validDaysMinimum: 30,
    label: "ssl-certificate",
    enabled: true,
  });

  const result = await prerequisite.verify();
  expect(result).toBe(PrerequisiteStatusEnum.success);

  sslCheckerSpy.mockRestore();
});

test("fails when certificate is valid but expires too soon", async () => {
  const sslCheckerSpy = spyOn(sslChecker, "default").mockImplementation(
    // @ts-expect-error
    async () => ({
      valid: true,
      daysRemaining: 10,
    }),
  );

  const prerequisite = new PrerequisiteSSLCertificateExpiry({
    host: "example.com",
    validDaysMinimum: 30,
    label: "ssl-certificate",
    enabled: true,
  });

  const result = await prerequisite.verify();
  expect(result).toBe(PrerequisiteStatusEnum.failure);

  sslCheckerSpy.mockRestore();
});

test("fails when certificate is invalid", async () => {
  const sslCheckerSpy = spyOn(sslChecker, "default").mockImplementation(
    // @ts-expect-error
    async () => ({
      valid: false,
      daysRemaining: 0,
    }),
  );

  const prerequisite = new PrerequisiteSSLCertificateExpiry({
    host: "example.com",
    validDaysMinimum: 30,
    label: "ssl-certificate",
    enabled: true,
  });

  const result = await prerequisite.verify();
  expect(result).toBe(PrerequisiteStatusEnum.failure);

  sslCheckerSpy.mockRestore();
});

test("fails when sslChecker throws", async () => {
  const sslCheckerSpy = spyOn(sslChecker, "default").mockImplementation(() => {
    throw new Error("SSL check failed");
  });

  const prerequisite = new PrerequisiteSSLCertificateExpiry({
    host: "example.com",
    validDaysMinimum: 30,
    label: "ssl-certificate",
    enabled: true,
  });

  const result = await prerequisite.verify();
  expect(result).toBe(PrerequisiteStatusEnum.failure);

  sslCheckerSpy.mockRestore();
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
