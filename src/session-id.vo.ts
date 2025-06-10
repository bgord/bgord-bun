import { Lucia } from "lucia";

export class SessionId {
  private value: string | null;

  constructor(cookie: string | undefined, lucia: Lucia) {
    this.value = lucia.readSessionCookie(cookie ?? "");
  }

  get(): SessionId["value"] {
    return this.value;
  }
}
