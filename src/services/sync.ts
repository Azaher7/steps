import { PersistedState, WalkSession } from '\''../types'\'';
import { supabase } from '\''./supabase'\'';

export type SyncResult = { syncedWalkIds: string[]; activityDates: string[]; error?: string };
export type CloudSnapshot = { walks: WalkSession[]; activity: PersistedState['\''activity'\'']; settings?: Partial<PersistedState['\''settings'\'']> };
export async function fetchCloudSnapshot(userId: string): Promise<CloudSnapshot> {
  if (!supabase) return { walks: [], activity: {} };
  const [walkResult, activityResult, preferenceResult] = await Promise.all([
    supabase.from('\''walk_sessions'\'').select('\''*'\'').eq('\''user_id'\'', userId),
    supabase.from('\''daily_activity'\'').select('\''*'\'').eq('\''user_id'\'', userId),
    supabase.from('\''user_preferences'\'').select('\''*'\'').eq('\''user_id'\'', userId).maybeSingle(),
  ]);
  const error = walkResult.error ?? activityResult.error ?? preferenceResult.error; if (error) throw error;
  const walks: WalkSession[] = (walkResult.data ?? []).map((row: Record<string, unknown>) => ({ id: String(row.id), startedAt: String(row.started_at), endedAt: String(row.ended_at), durationSeconds: Number(row.duration_seconds), distanceMeters: Number(row.distance_meters), steps: Number(row.steps), route: (Array.isArray(row.route) ? row.route : []) as WalkSession['\''route'\''], updatedAt: String(row.updated_at), syncStatus: '\''synced'\'' }));
  const activity = Object.fromEntries((activityResult.data ?? []).map((row: Record<string, unknown>) => [String(row.activity_date), { date: String(row.activity_date), steps: Number(row.steps), distanceMeters: Number(row.distance_meters), activeMinutes: Number(row.active_minutes), calories: Number(row.calories), updatedAt: String(row.updated_at), syncStatus: '\''synced'\'' as const }]));
  const p = preferenceResult.data; return { walks, activity, settings: p ? { stepGoal: p.step_goal, units: p.units, theme: p.theme } : undefined };
}

export function mergeCloudSnapshot(local: PersistedState, cloud: CloudSnapshot): PersistedState {
  const walks = new Map(local.walks.map(w => [w.id, w]));
  for (const remote of cloud.walks) { const current = walks.get(remote.id); if (!current || (remote.updatedAt ?? '\'''\'') > (current.updatedAt ?? '\'''\'')) walks.set(remote.id, remote); }
  const activity = { ...cloud.activity, ...local.activity };
  for (const [date, remote] of Object.entries(cloud.activity)) { const current = local.activity[date]; if (!current || (remote.updatedAt ?? '\'''\'') > (current.updatedAt ?? '\'''\'')) activity[date] = remote; }
  return { ...local, settings: { ...local.settings, ...cloud.settings }, walks: [...walks.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt)), activity };
}
export async function syncLocalState(state: PersistedState, userId: string): Promise<SyncResult> {
  if (!supabase) return { syncedWalkIds: [], activityDates: [], error: '\''Cloud sync is not configured.'\'' };
  const pendingWalks = state.walks.filter(w => w.syncStatus !== '\''synced'\'');
  const walkRows = pendingWalks.map(w => ({ id: w.id, user_id: userId, started_at: w.startedAt, ended_at: w.endedAt, duration_seconds: w.durationSeconds, distance_meters: w.distanceMeters, steps: w.steps, route: w.route, updated_at: w.updatedAt ?? w.endedAt }));
  if (walkRows.length) { const { error } = await supabase.from('\''walk_sessions'\'').upsert(walkRows, { onConflict: '\''id'\'' }); if (error) return { syncedWalkIds: [], activityDates: [], error: error.message }; }
  const activityRows = Object.values(state.activity).filter(a => a.syncStatus !== '\''synced'\'').map(a => ({ user_id: userId, activity_date: a.date, steps: a.steps, distance_meters: a.distanceMeters, active_minutes: a.activeMinutes, calories: a.calories, updated_at: a.updatedAt ?? new Date().toISOString() }));
  if (activityRows.length) { const { error } = await supabase.from('\''daily_activity'\'').upsert(activityRows, { onConflict: '\''user_id,activity_date'\'' }); if (error) return { syncedWalkIds: pendingWalks.map(w => w.id), activityDates: [], error: error.message }; }
  const { error: preferenceError } = await supabase.from('\''user_preferences'\'').upsert({ user_id: userId, step_goal: state.settings.stepGoal, units: state.settings.units, theme: state.settings.theme, updated_at: new Date().toISOString() });
  return { syncedWalkIds: pendingWalks.map(w => w.id), activityDates: activityRows.map(a => a.activity_date), error: preferenceError?.message };
}

export function markSynced(state: PersistedState, result: SyncResult): PersistedState {
  const ids = new Set(result.syncedWalkIds);
  const dates = new Set(result.activityDates);
  return { ...state, walks: state.walks.map(w => ids.has(w.id) ? { ...w, syncStatus: '\''synced'\'' } as WalkSession : w), activity: Object.fromEntries(Object.entries(state.activity).map(([key, value]) => [key, dates.has(key) ? { ...value, syncStatus: '\''synced'\'' } : value])) };
}
