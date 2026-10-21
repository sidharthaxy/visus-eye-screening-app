// Thin Gemini client (Google AI Studio API) used by features/agent.
// Sends a prompt with a JSON schema and returns the parsed JSON, or null on any failure,
// so callers can fall back to the rules. Tries the next model when one is busy.
import { z } from 'zod';

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
/**
 * Flash-Lite first: it answers in 1–2 s while the person waits on a screen. The bigger Flash
 * models take over when it is busy (503/429) or slow.
 */
export const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.6-flash'];
const TIMEOUT_MS = 8_000;

/** Models that just said they're busy are skipped for a minute (per Worker instance). */
const busyUntil = new Map<string, number>();

type Options<T extends z.ZodType> = { apiKey: string; system: string; prompt: string; schema: T; models?: string[] };

export async function geminiJson<T extends z.ZodType>({ apiKey, system, prompt, schema, models = GEMINI_MODELS }: Options<T>): Promise<z.infer<T> | null> {
  if (!apiKey) return null;
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseJsonSchema: z.toJSONSchema(schema, { target: 'draft-7' }),
      temperature: 0.4,
      thinkingConfig: { thinkingLevel: 'low' },
    },
  });
  const ready = models.filter((m) => (busyUntil.get(m) ?? 0) < Date.now());
  for (const model of ready.length ? ready : models) {
    try {
      const res = await fetch(`${BASE}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.status === 503 || res.status === 429 || res.status === 404) {
        console.warn(`Gemini ${model}: ${res.status}, trying the next model`);
        busyUntil.set(model, Date.now() + 60_000);
        continue;
      }
      if (!res.ok) {
        console.warn(`Gemini ${model}: ${res.status} ${(await res.text()).slice(0, 200)}`);
        return null;
      }
      const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      const parsed = schema.safeParse(JSON.parse(text));
      if (parsed.success) return parsed.data;
      console.warn(`Gemini ${model}: reply didn't match the schema`, parsed.error.issues[0]);
      return null;
    } catch (err) {
      console.warn(`Gemini ${model}: ${(err as Error).message}`);
    }
  }
  return null;
}
