import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedState } from '../types';
export const STORAGE_KEY='@stride/state/v1';
export const defaults:PersistedState={onboarded:false,settings:{stepGoal:10000,units:'metric',theme:'system',haptics:true,keepScreenAwake:false},walks:[],activity:{}};
export async function loadState():Promise<PersistedState>{const raw=await AsyncStorage.getItem(STORAGE_KEY);if(!raw)return defaults;try{const value=JSON.parse(raw) as Partial<PersistedState>;return{...defaults,...value,settings:{...defaults.settings,...value.settings},walks:value.walks??[],activity:value.activity??{}};}catch{return defaults;}}
export const saveState=(state:PersistedState)=>AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(state));
