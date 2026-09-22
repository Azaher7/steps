export type Units = 'metric' | 'imperial';
export type ThemePreference = 'system' | 'light' | 'dark';
export type Coordinate = { latitude: number; longitude: number; timestamp: number; accuracy?: number | null; speed?: number | null };
export type WalkSession = { id: string; startedAt: string; endedAt: string; durationSeconds: number; distanceMeters: number; steps: number; route: Coordinate[]; syncStatus?: 'local' | 'syncing' | 'synced' | 'error'; updatedAt?: string };
export type ActiveWalk = { id: string; startedAt: string; status: 'active' | 'paused'; activeSeconds: number; lastResumedAt: number | null; route: Coordinate[]; lastSignalAt: number | null };
export type DailyActivity = { date: string; steps: number; distanceMeters: number; activeMinutes: number; calories: number; updatedAt?: string; syncStatus?: 'local' | 'synced' | 'error' };
export type Settings = { stepGoal: number; units: Units; theme: ThemePreference; haptics: boolean; keepScreenAwake: boolean; backgroundTracking: boolean };
export type PersistedState = { onboarded: boolean; settings: Settings; walks: WalkSession[]; activity: Record<string, DailyActivity> };
