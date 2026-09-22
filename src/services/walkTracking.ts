import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { ACTIVE_WALK_KEY, loadActiveWalk, saveActiveWalk } from '../data/storage';
import { ActiveWalk, Coordinate } from '../types';
import { haversineMeters } from '../utils/calculations';

export const WALK_LOCATION_TASK = 'stride-background-walk-location';
export const MAX_ACCURACY_METERS = 50;
export const MAX_REASONABLE_SPEED_MPS = 8;

export function isPlausiblePoint(previous: Coordinate | undefined, next: Coordinate): boolean {
  if (!Number.isFinite(next.latitude) || !Number.isFinite(next.longitude)) return false;
  if ((next.accuracy ?? 999) > MAX_ACCURACY_METERS) return false;
  if (!previous) return true;
  const elapsed = (next.timestamp - previous.timestamp) / 1000;
  if (elapsed <= 0) return false;
  const reportedSpeed = next.speed ?? 0;
  return haversineMeters(previous, next) / elapsed <= MAX_REASONABLE_SPEED_MPS && reportedSpeed <= MAX_REASONABLE_SPEED_MPS;
}

export function appendFilteredPoints(walk: ActiveWalk, incoming: Coordinate[]): ActiveWalk {
  const route = [...walk.route];
  for (const point of incoming.sort((a, b) => a.timestamp - b.timestamp)) {
    if (isPlausiblePoint(route.at(-1), point)) route.push(point);
  }
  return { ...walk, route, lastSignalAt: route.at(-1)?.timestamp ?? walk.lastSignalAt };
}

if (!TaskManager.isTaskDefined(WALK_LOCATION_TASK)) {
  TaskManager.defineTask(WALK_LOCATION_TASK, async ({ data, error }) => {
    if (error || !data) return;
    const active = await loadActiveWalk();
    if (!active || active.status !== 'active') return;
    const locations = (data as { locations: Location.LocationObject[] }).locations;
    const points = locations.map(toCoordinate);
    await saveActiveWalk(appendFilteredPoints(active, points));
  });
}

export const toCoordinate = (location: Location.LocationObject): Coordinate => ({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  accuracy: location.coords.accuracy,
  speed: location.coords.speed,
  timestamp: location.timestamp,
});

export async function getRealCurrentPosition(): Promise<Coordinate> {
  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) throw new Error('LOCATION_SERVICES_DISABLED');
  const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  const point = toCoordinate(location);
  if ((point.accuracy ?? 999) > 100) throw new Error('LOCATION_SIGNAL_WEAK');
  return point;
}

export async function startBackgroundTracking(): Promise<void> {
  if (await Location.hasStartedLocationUpdatesAsync(WALK_LOCATION_TASK)) return;
  await Location.startLocationUpdatesAsync(WALK_LOCATION_TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    distanceInterval: 5,
    timeInterval: 3000,
    pausesUpdatesAutomatically: false,
    activityType: Location.ActivityType.Fitness,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Stride is recording your walk',
      notificationBody: 'Tap to return to your live route.',
      notificationColor: '#9DEB72',
    },
  });
}

export async function stopBackgroundTracking(): Promise<void> {
  if (await Location.hasStartedLocationUpdatesAsync(WALK_LOCATION_TASK)) await Location.stopLocationUpdatesAsync(WALK_LOCATION_TASK);
}
