import { $ } from "bun";

export async function shell(command: TemplateStringsArray) {
  return await $(command);
}
