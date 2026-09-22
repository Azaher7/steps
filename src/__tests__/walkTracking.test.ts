import { appendFilteredPoints, isPlausiblePoint } from '../services/walkTracking';
import { ActiveWalk, Coordinate } from '../types';

jest.mock('expo-task-manager', () => ({ isTaskDefined: () => true, defineTask: jest.fn() }));
jest.mock('expo-location', () => ({}));
const point = (longitude: number, timestamp: number, accuracy = 5): Coordinate => ({ latitude: 0, longitude, timestamp, accuracy, speed: 1 });
describe('GPS quality filtering', () => {
  test('accepts accurate walking movement', () => expect(isPlausiblePoint(point(0, 0), point(.00001, 2000))).toBe(true));
  test('rejects inaccurate fixes and impossible jumps', () => { expect(isPlausiblePoint(undefined, point(0, 0, 100))).toBe(false); expect(isPlausiblePoint(point(0, 0), point(1, 1000))).toBe(false); });
  test('only appends plausible ordered points', () => { const walk: ActiveWalk = { id: '1', startedAt: '', status: 'active', activeSeconds: 0, lastResumedAt: 0, route: [point(0, 0)], lastSignalAt: 0 }; expect(appendFilteredPoints(walk, [point(1, 1000), point(.00001, 2000)]).route).toHaveLength(2); });
});
