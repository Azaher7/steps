import { mergeCloudSnapshot } from '../services/sync';
import { defaults } from '../data/storage';
describe('cloud conflict handling', () => {
  test('newer local activity wins and remote walks restore', () => { const local = { ...defaults, activity: { '2026-01-01': { date: '2026-01-01', steps: 20, distanceMeters: 1, activeMinutes: 1, calories: 1, updatedAt: '2026-01-02' } } }; const result = mergeCloudSnapshot(local, { walks: [{ id: 'w', startedAt: '2026-01-01', endedAt: '2026-01-01', durationSeconds: 1, distanceMeters: 1, steps: 1, route: [] }], activity: { '2026-01-01': { date: '2026-01-01', steps: 10, distanceMeters: 1, activeMinutes: 1, calories: 1, updatedAt: '2026-01-01' } } }); expect(result.activity['2026-01-01']?.steps).toBe(20); expect(result.walks).toHaveLength(1); });
});
