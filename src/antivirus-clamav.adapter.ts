import { type AntivirusPort, AntivirusPortError, type AntivirusScanResult } from "./antivirus.port";

// Stryker disable all
export class AntivirusClamavAdapter implements AntivirusPort {
  async scanBytes(bytes: Uint8Array): Promise<AntivirusScanResult> {
    const SIGNATURE_REGEX = /:\s+(?<signature>.+)\s+FOUND\s*$/m;

    const antivirus = Bun.spawn({
      cmd: ["clamscan", "--infected", "--no-summary", "--stdout", "-"],
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    if (!antivirus.stdin) throw new Error(AntivirusPortError.ScanFailed);

    antivirus.stdin.write(bytes);
    await antivirus.stdin.end();

    await antivirus.exited;

    const stdoutText = await new Response(antivirus.stdout).text();
    const stderrText = await new Response(antivirus.stderr).text();

    if (antivirus.exitCode === 0) return { clean: true };

    if (antivirus.exitCode === 1) {
      const signature = stdoutText.match(SIGNATURE_REGEX) ?? stderrText.match(SIGNATURE_REGEX);

      return { clean: false, signature: signature?.groups?.signature?.trim() ?? "Unknown" };
    }

    throw new Error(AntivirusPortError.ScanFailed);
  }
}
// Stryker restore all
