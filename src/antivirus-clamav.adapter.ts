import { type AntivirusPort, AntivirusPortError, type AntivirusScanResult } from "./antivirus.port";

export class AntivirusClamavAdapter implements AntivirusPort {
  // Stryker disable all
  private readonly signature = /:\s+(?<signature>.+)\s+FOUND\s*$/m;
  // Stryker restore all

  async scan(bytes: Uint8Array): Promise<AntivirusScanResult> {
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

      // Stryker disable all
      return { clean: false, signature: signature?.groups?.signature?.trim() ?? "unknown" };
      // Stryker restore all
    }

    throw new Error(AntivirusPortError.ScanFailed);
  }
}
