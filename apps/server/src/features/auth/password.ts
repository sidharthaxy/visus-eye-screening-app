// Hash and verify passwords with PBKDF2 (Web Crypto) + PASSWORD_PEPPER.
// Workers allow at most 100,000 PBKDF2 iterations.
const ITERATIONS = 100_000;

const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0));

async function derive(password: string, pepper: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password + pepper), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256);
  return new Uint8Array(bits);
}

/** "salt:hash", both base64. */
export async function hashPassword(password: string, pepper: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${toB64(salt)}:${toB64(await derive(password, pepper, salt))}`;
}

export async function verifyPassword(password: string, pepper: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const actual = await derive(password, pepper, fromB64(salt));
  const expected = fromB64(hash);
  if (actual.length !== expected.length) return false;
  let diff = 0; // constant time
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}
