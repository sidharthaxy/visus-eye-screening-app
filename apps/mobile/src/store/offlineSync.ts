import { useEffect } from 'react';

import { useOnline } from '@/services/network';
import { getMyProfile } from '@/services/profiles';
import { createSession, getVerdict, submitResult } from '@/services/sessions';
import { useAuth } from '@/store/auth';
import { useOffline } from '@/store/offline';

let syncing = false;

/** Sends tests taken offline, oldest first, as soon as the phone is online. Stops at the first failure. */
async function sendPending() {
  if (syncing) return;
  syncing = true;
  try {
    for (const item of useOffline.getState().pending) {
      const profileId = item.profileId || (await getMyProfile()).id;
      const session = await createSession({ profileId, intake: '', mode: 'single', testId: item.testId });
      await submitResult(session.sessionId, item.result);
      await getVerdict(session.sessionId);
      useOffline.getState().remove(item.id);
    }
  } catch {
    // Still offline or the server failed: try again next time the app is online.
  } finally {
    syncing = false;
  }
}

/** Mounted once in the root layout. */
export function useOfflineSync() {
  const online = useOnline();
  const signedIn = useAuth((s) => s.user !== null);
  const waiting = useOffline((s) => s.pending.length);

  useEffect(() => {
    if (online && signedIn && waiting > 0) void sendPending();
  }, [online, signedIn, waiting]);
}
