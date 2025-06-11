import hono from "hono";

export async function safeParseBody(c: hono.Context): Promise<any> {
  try {
    const rawBody = await c.req.text();

    if (!rawBody.trim()) return {}; // handles truly empty body

    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}
