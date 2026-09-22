export type Units='metric'|'imperial';
export type ThemePreference='system'|'light'|'dark';
export type Coordinate={latitude:number;longitude:number;timestamp:number;accuracy?:number|null};
export type WalkSession={id:string;startedAt:string;endedAt:string;durationSeconds:number;distanceMeters:number;steps:number;route:Coordinate[]};
export type DailyActivity={date:string;steps:number;distanceMeters:number;activeMinutes:number;calories:number};
export type Settings={stepGoal:number;units:Units;theme:ThemePreference;haptics:boolean;keepScreenAwake:boolean};
export type PersistedState={onboarded:boolean;settings:Settings;walks:WalkSession[];activity:Record<string,DailyActivity>};
