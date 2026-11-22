// The call (remote consult): join (Agora token), end, and GET /live, which every device polls every 2 s.
// Agora carries only video and voice; captions, live tests and the prescription state come from here.
import type { Caption, ConsultTest, JoinConsultResponse, LiveState } from '@visus/shared';
import { and, asc, eq, gt } from 'drizzle-orm';

import type { Db } from '../../db/client';
import { consultCaptions, consults, consultTests, prescriptions } from '../../db/schema';
import { agoraToken, CALL_UID } from '../../lib/agora';
import type { Bindings } from '../../lib/env';
import { fail } from '../../lib/errors';
import { canJoin, consultFor, joinEarlyMs, statusOf, toSummaries, type Urls } from './consults.service';

type TestRow = typeof consultTests.$inferSelect;
type CaptionRow = typeof consultCaptions.$inferSelect;

export const toTest = (t: TestRow): ConsultTest => ({
  id: t.id,
  testId: t.testId,
  eye: t.eye as ConsultTest['eye'],
  status: t.status as ConsultTest['status'],
  pushedAt: t.pushedAt.toISOString(),
  result: t.result ?? null,
});

export const toCaption = (c: CaptionRow): Caption => ({
  id: String(c.id),
  at: c.at.toISOString(),
  from: c.fromRole as Caption['from'],
  language: c.language,
  text: c.text,
  translations: c.translations,
});

/** POST /consults/:id/join: from 10 minutes before the start until it ends. The first join makes it live. */
export async function joinConsult(db: Db, env: Bindings, userId: string, id: string): Promise<JoinConsultResponse> {
  const { row, role } = await consultFor(db, userId, id);
  const status = statusOf(row);
  const early = joinEarlyMs(env.CONSULT_JOIN_EARLY_MIN);
  if (!canJoin(row, early)) {
    if (status === 'scheduled') fail(409, `You can join from ${early / 60_000} minutes before the start.`);
    fail(409, `This consult is ${status}.`);
  }
  if (!env.AGORA_APP_ID) fail(503, 'Video calls are not set up on this server yet.');
  if (status === 'scheduled') await db.update(consults).set({ status: 'live', startedAt: new Date() }).where(eq(consults.id, row.id));
  const uid = CALL_UID[role];
  const { token, expiresAt } = agoraToken(env.AGORA_APP_ID, env.AGORA_APP_CERTIFICATE, row.id, uid);
  return { appId: env.AGORA_APP_ID, channel: row.id, token, uid, role, expiresAt };
}

/** POST /consults/:id/end (doctor): the consult is completed. A pending live test is cancelled. */
export async function endConsult(db: Db, userId: string, id: string, urls: Urls) {
  const { row, role } = await consultFor(db, userId, id);
  if (role !== 'doctor') fail(403, 'Only the doctor can end the consult.');
  const status = statusOf(row);
  if (status === 'cancelled') fail(409, 'This consult was cancelled.');
  let next = row;
  if (status !== 'completed') {
    [next] = await db.update(consults).set({ status: 'completed', endedAt: new Date() }).where(eq(consults.id, row.id)).returning();
    await db.update(consultTests).set({ status: 'cancelled' }).where(and(eq(consultTests.consultId, row.id), eq(consultTests.status, 'pushed')));
  }
  return (await toSummaries(db, [next], role, urls))[0];
}

/** GET /consults/:id/live?after=<captionId>: one access query, then three small reads in parallel. */
export async function liveState(db: Db, userId: string, id: string, after: string | undefined): Promise<LiveState> {
  const { row } = await consultFor(db, userId, id);
  const afterId = after && /^\d+$/.test(after) ? Number(after) : 0;
  const [tests, captions, rx] = await Promise.all([
    db.select().from(consultTests).where(eq(consultTests.consultId, row.id)).orderBy(asc(consultTests.pushedAt)),
    db
      .select()
      .from(consultCaptions)
      .where(and(eq(consultCaptions.consultId, row.id), gt(consultCaptions.id, afterId)))
      .orderBy(asc(consultCaptions.id))
      .limit(100),
    db.select({ status: prescriptions.status }).from(prescriptions).where(eq(prescriptions.consultId, row.id)),
  ]);
  const pending = [...tests].reverse().find((t) => t.status === 'pushed') ?? null;
  return {
    status: statusOf(row),
    pendingTest: pending && toTest(pending),
    tests: tests.map(toTest),
    captions: captions.map(toCaption),
    prescriptionSaved: rx[0]?.status === 'final',
  };
}

