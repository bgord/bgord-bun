import { type AntivirusPort, AntivirusPortError, type AntivirusScanResult } from "./antivirus.port";

export class AntivirusClamavAdapter implements AntivirusPort {
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

    const stdoutText = await new Response(antivirus.stdout).text();
    const stderrText = await new Response(antivirus.stderr).text();

    if (antivirus.exitCode === 0) return { clean: true };

    if (antivirus.exitCode === 1) {
      const match =
        stdoutText.match(/:\s+(?<signature>.+)\s+FOUND\s*$/m) ??
        stderrText.match(/:\s+(?<signature>.+)\s+FOUND\s*$/m);

      return { clean: false, signature: match?.groups?.signature?.trim() ?? "Unknown" };
    }

    throw new Error(AntivirusPortError.ScanFailed);
  }
}
