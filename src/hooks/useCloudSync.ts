import { useCallback, useEffect, useRef, useState } from '\''react'\'';
import NetInfo from '\''@react-native-community/netinfo'\'';
import { useApp } from '\''../context/AppContext'\'';
import { useAuth } from '\''../context/AuthContext'\'';
import { fetchCloudSnapshot, syncLocalState } from '\''../services/sync'\'';

export function useCloudSync() {
  const { state, applySyncResult, mergeCloud } = useApp(); const { session } = useAuth(); const restoredUser = useRef<string | null>(null);
  const [status, setStatus] = useState<'\''offline'\''|'\''idle'\''|'\''syncing'\''|'\''synced'\''|'\''error'\''>('\''idle'\'');
  const sync = useCallback(async () => {
    if (!session) return setStatus('\''idle'\'');
    const network = await NetInfo.fetch(); if (!network.isConnected) return setStatus('\''offline'\'');
    setStatus('\''syncing'\'');
    if (restoredUser.current !== session.user.id) { try { mergeCloud(await fetchCloudSnapshot(session.user.id)); restoredUser.current = session.user.id; return; } catch { setStatus('\''error'\''); return; } }
    const result = await syncLocalState(state, session.user.id); applySyncResult(result);
    setStatus(result.error ? '\''error'\'' : '\''synced'\'');
  }, [session, state, applySyncResult, mergeCloud]);
  useEffect(() => { const timer = setTimeout(sync, 1500); return () => clearTimeout(timer); }, [sync]);
  return { status, sync };
}
