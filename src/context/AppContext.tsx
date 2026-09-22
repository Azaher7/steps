<<<<<<< ours
import React,{createContext,useContext,useEffect,useMemo,useState}from'react';
import { PersistedState, Settings, WalkSession } from '../types';
import { defaults,loadState,saveState } from '../data/storage';
import { activeMinutesFromSteps,caloriesFromSteps,dateKey,distanceFromSteps } from '../utils/calculations';
type Context={state:PersistedState;ready:boolean;storageError:boolean;completeOnboarding():void;updateSettings(patch:Partial<Settings>):void;syncSteps(steps:number):void;addWalk(walk:WalkSession):void};
const AppContext=createContext<Context|undefined>(undefined);
export function AppProvider({children}:{children:React.ReactNode}){const[state,setState]=useState(defaults);const[ready,setReady]=useState(false);const[storageError,setStorageError]=useState(false);useEffect(()=>{loadState().then(setState).catch(()=>setStorageError(true)).finally(()=>setReady(true));},[]);useEffect(()=>{if(ready)saveState(state).catch(()=>setStorageError(true));},[state,ready]);const value=useMemo<Context>(()=>({state,ready,storageError,completeOnboarding:()=>setState(s=>({...s,onboarded:true})),updateSettings:patch=>setState(s=>({...s,settings:{...s.settings,...patch}})),syncSteps:steps=>setState(s=>{const key=dateKey();const old=s.activity[key];if(old?.steps===steps)return s;return{...s,activity:{...s.activity,[key]:{date:key,steps,distanceMeters:distanceFromSteps(steps),activeMinutes:activeMinutesFromSteps(steps),calories:caloriesFromSteps(steps)}}};}),addWalk:walk=>setState(s=>({...s,walks:[walk,...s.walks]}))}),[state,ready,storageError]);return <AppContext.Provider value={value}>{children}</AppContext.Provider>};
export const useApp=()=>{const value=useContext(AppContext);if(!value)throw new Error('useApp must be used within AppProvider');return value;};
=======
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from '\''react'\'';
import { PersistedState, Settings, WalkSession } from '\''../types'\'';
import { defaults, loadState, saveState } from '\''../data/storage'\'';
import { activeMinutesFromSteps, aggregateWalk, caloriesFromSteps, dateKey, distanceFromSteps } from '\''../utils/calculations'\'';
import { CloudSnapshot, markSynced, mergeCloudSnapshot, SyncResult } from '\''../services/sync'\'';

type Context = { state: PersistedState; ready: boolean; storageError: boolean; completeOnboarding(): void; updateSettings(patch: Partial<Settings>): void; syncSteps(steps: number): void; addWalk(walk: WalkSession): void; applySyncResult(result: SyncResult): void; mergeCloud(snapshot: CloudSnapshot): void };
const AppContext = createContext<Context | undefined>(undefined);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(defaults); const [ready, setReady] = useState(false); const [storageError, setStorageError] = useState(false);
  useEffect(() => { loadState().then(setState).catch(() => setStorageError(true)).finally(() => setReady(true)); }, []);
  useEffect(() => { if (ready) saveState(state).catch(() => setStorageError(true)); }, [state, ready]);
  const applySyncResult = useCallback((result: SyncResult) => { if (result.syncedWalkIds.length || result.activityDates.length) setState(s => markSynced(s, result)); }, []);
  const mergeCloud = useCallback((snapshot: CloudSnapshot) => setState(s => mergeCloudSnapshot(s, snapshot)), []);
  const value = useMemo<Context>(() => ({
    state, ready, storageError, applySyncResult, mergeCloud,
    completeOnboarding: () => setState(s => ({ ...s, onboarded: true })),
    updateSettings: patch => setState(s => ({ ...s, settings: { ...s.settings, ...patch } })),
    syncSteps: steps => setState(s => { const key = dateKey(); const old = s.activity[key]; if (old?.steps === steps) return s; return { ...s, activity: { ...s.activity, [key]: { date: key, steps, distanceMeters: distanceFromSteps(steps), activeMinutes: activeMinutesFromSteps(steps), calories: caloriesFromSteps(steps), updatedAt: new Date().toISOString(), syncStatus: '\''local'\'' } } }; }),
    addWalk: walk => setState(s => { const key = dateKey(new Date(walk.startedAt)); return { ...s, walks: [{ ...walk, syncStatus: '\''local'\'', updatedAt: new Date().toISOString() }, ...s.walks], activity: { ...s.activity, [key]: aggregateWalk(s.activity[key], key, walk) } }; }),
  }), [state, ready, storageError, applySyncResult, mergeCloud]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp = () => { const value = useContext(AppContext); if (!value) throw new Error('\''useApp must be used within AppProvider'\''); return value; };
>>>>>>> theirs
