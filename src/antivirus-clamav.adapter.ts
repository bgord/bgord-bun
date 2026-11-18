// [BUN DEPENDENCY]
import type * as tools from "@bgord/tools";
import { type AntivirusPort, AntivirusPortError, type AntivirusScanResult } from "./antivirus.port";

export type AntivirusClamavAdapterConfig = { timeout: tools.Duration };

export class AntivirusClamavAdapter implements AntivirusPort {
  // Stryker disable all
  private readonly signature = /:\s+(?<signature>.+)\s+FOUND\s*$/m;
  // Stryker restore all

  constructor(private readonly config: AntivirusClamavAdapterConfig) {}

  async scan(bytes: Uint8Array): Promise<AntivirusScanResult> {
    const antivirus = Bun.spawn({
      cmd: ["clamscan", "--infected", "--no-summary", "--stdout", "-"],
      stdin: bytes,
      stdout: "pipe",
      stderr: "pipe",
      timeout: this.config.timeout.ms,
      killSignal: "SIGKILL",
    });

    const stdoutText = new Response(antivirus.stdout).text();
    const stderrText = new Response(antivirus.stderr).text();

    await antivirus.exited;

    const [stdout, stderr] = await Promise.all([stdoutText, stderrText]);

    if (antivirus.exitCode === 0) return { clean: true };

    if (antivirus.exitCode === 1) {
      const signature = stdout.match(this.signature) ?? stderr.match(this.signature);

      // Stryker disable all
      return { clean: false, signature: signature?.groups?.["signature"] ?? "unknown" };
      // Stryker restore all
    }

    throw new Error(AntivirusPortError.ScanFailed, { cause: stderr });
  }
}
