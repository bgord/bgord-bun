export class LivenessHandler {
  execute(): { ok: true; headers: Record<string, string> } {
    return { ok: true, headers: { "Cache-Control": "no-store" } };
  }
}
