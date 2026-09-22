import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';
import { dateKey } from '../utils/calculations';

export type PedometerState = { steps: number; status: 'loading'|'available'|'unavailable'|'denied'|'error'; limitation?: string; refresh(): void };
const androidKey = (date: string) => `@stride/android-observed-steps/${date}`;
export function usePedometer(): PedometerState {
  const [steps, setSteps] = useState(0); const [status, setStatus] = useState<PedometerState['status']>('loading'); const [tick, setTick] = useState(0); const [limitation, setLimitation] = useState<string>();
  useEffect(() => {
    let mounted = true; let subscription: { remove(): void } | undefined;
    const start = async () => {
      setStatus('loading');
      try {
        if (!await Pedometer.isAvailableAsync()) { if (mounted) setStatus('unavailable'); return; }
        const permission = await Pedometer.requestPermissionsAsync(); if (!permission.granted) { if (mounted) setStatus('denied'); return; }
        const day = dateKey(); let baseline = 0;
        if (Platform.OS === 'ios') { const from = new Date(); from.setHours(0, 0, 0, 0); baseline = (await Pedometer.getStepCountAsync(from, new Date())).steps; }
        else { baseline = Number(await AsyncStorage.getItem(androidKey(day))) || 0; setLimitation('Android shows steps observed by Stride today; some devices do not expose historical steps while the app was stopped.'); }
        if (mounted) { setSteps(baseline); setStatus('available'); }
        subscription = Pedometer.watchStepCount(({ steps: live }) => { if (!mounted) return; const total = baseline + live; setSteps(total); if (Platform.OS === 'android') AsyncStorage.setItem(androidKey(day), String(total)).catch(() => undefined); });
      } catch { if (mounted) setStatus('error'); }
    };
    start(); const appSubscription = AppState.addEventListener('change', next => { if (next === 'active' && Platform.OS === 'ios') setTick(value => value + 1); });
    const midnightCheck = setInterval(() => { if (dateKey() !== dateKey(new Date(Date.now() - 60000))) setTick(value => value + 1); }, 60000);
    return () => { mounted = false; subscription?.remove(); appSubscription.remove(); clearInterval(midnightCheck); };
  }, [tick]);
  return { steps, status, limitation, refresh: () => setTick(value => value + 1) };
}
