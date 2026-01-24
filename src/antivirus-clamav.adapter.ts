import { type AntivirusPort, AntivirusPortError, type AntivirusScanResult } from "./antivirus.port";

// Stryker disable all
export class AntivirusClamavAdapter implements AntivirusPort {
  private readonly signature = /:\s+(?<signature>.+)\s+FOUND\s*$/m;

  async scanBytes(bytes: Uint8Array): Promise<AntivirusScanResult> {
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

    const [stdout, stderr] = await Promise.all([
      new Response(antivirus.stdout).text(),
      new Response(antivirus.stderr).text(),
    ]);

    if (antivirus.exitCode === 0) return { clean: true };

    if (antivirus.exitCode === 1) {
      const signature = stdout.match(this.signature) ?? stderr.match(this.signature);

      return { clean: false, signature: signature?.groups?.signature?.trim() ?? "unknown" };
    }

    throw new Error(AntivirusPortError.ScanFailed);
  }
}
// Stryker restore all
