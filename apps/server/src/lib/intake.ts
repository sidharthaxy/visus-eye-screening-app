// The intake is the chat transcript, one message per line: "Visus: …" (AI) / "Me: …" (user).
// Rules must read only what the user said: the AI's own questions mention flashes, night, etc.
import type { IntakeMessage } from '@visus/shared';

export const toTranscript = (messages: IntakeMessage[]) =>
  messages.map((m) => `${m.from === 'me' ? 'Me' : 'Visus'}: ${m.text.replace(/\s+/g, ' ').trim()}`).join('\n');

/** What the user said. Older plain-text intakes are returned whole. */
export function userText(intake: string) {
  if (!/^(Me|Visus): /m.test(intake)) return intake;
  return intake
    .split('\n')
    .filter((line) => line.startsWith('Me: '))
    .map((line) => line.slice(4))
    .join('\n');
}
