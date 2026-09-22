import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearActiveWalk, loadActiveWalk, saveActiveWalk } from '../data/storage';
import { ActiveWalk } from '../types';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
describe('active walk persistence', () => {
  beforeEach(() => AsyncStorage.clear());
  test('survives save/load and can be cleared', async () => { const walk: ActiveWalk = { id: 'walk-1', startedAt: '2026-01-01T00:00:00Z', status: 'paused', activeSeconds: 42, lastResumedAt: null, route: [], lastSignalAt: null }; await saveActiveWalk(walk); expect(await loadActiveWalk()).toEqual(walk); await clearActiveWalk(); expect(await loadActiveWalk()).toBeNull(); });
});
