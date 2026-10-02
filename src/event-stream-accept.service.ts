export class EventStreamAccept {
  static matches(accept: string | undefined): boolean {
    if (!accept) return false;

    return accept
      .toLowerCase()
      .split(",")
      .some((type) => type.split(";")[0]?.trim() === "text/event-stream");
  }
}
