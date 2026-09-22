<<<<<<< ours
import { Coordinate, DailyActivity } from '../types';
=======
import { Coordinate, DailyActivity } from '\''../types'\'';
>>>>>>> theirs
export const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
export const caloriesFromSteps=(steps:number)=>Math.round(steps*0.04);
export const distanceFromSteps=(steps:number,strideMeters=.762)=>steps*strideMeters;
export const activeMinutesFromSteps=(steps:number)=>Math.round(steps/100);
export const haversineMeters=(a:Coordinate,b:Coordinate)=>{const rad=(v:number)=>v*Math.PI/180;const R=6371000;const dLat=rad(b.latitude-a.latitude);const dLon=rad(b.longitude-a.longitude);const q=Math.sin(dLat/2)**2+Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(dLon/2)**2;return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));};
export const routeDistance=(points:Coordinate[])=>points.slice(1).reduce((sum,p,i)=>sum+haversineMeters(points[i]!,p),0);
<<<<<<< ours
export const formatDuration=(seconds:number)=>`${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds%3600/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
export const formatDistance=(meters:number,units:'metric'|'imperial')=>units==='metric'?`${(meters/1000).toFixed(2)} km`:`${(meters/1609.344).toFixed(2)} mi`;
export const pace=(meters:number,seconds:number,units:'metric'|'imperial')=>{if(meters<10||seconds<=0)return'—';const divisor=units==='metric'?1000:1609.344;const mins=seconds/(meters/divisor)/60;if(!Number.isFinite(mins)||mins>99)return'—';return `${Math.floor(mins)}:${String(Math.round((mins%1)*60)).padStart(2,'0')} /${units==='metric'?'km':'mi'}`};
export const dateKey=(d=new Date())=>{const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
export const calculateStreak=(activity:Record<string,DailyActivity>,goal:number,now=new Date())=>{let streak=0;const d=new Date(now);if((activity[dateKey(d)]?.steps??0)<goal)d.setDate(d.getDate()-1);while((activity[dateKey(d)]?.steps??0)>=goal){streak++;d.setDate(d.getDate()-1);}return streak;};
export const lastSevenDays=(activity:Record<string,DailyActivity>,now=new Date())=>Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-(6-i));return{date:dateKey(d),label:d.toLocaleDateString(undefined,{weekday:'short'}).slice(0,1),steps:activity[dateKey(d)]?.steps??0};});
=======
export const formatDuration=(seconds:number)=>`${String(Math.floor(seconds/3600)).padStart(2,'\''0'\'')}:${String(Math.floor(seconds%3600/60)).padStart(2,'\''0'\'')}:${String(seconds%60).padStart(2,'\''0'\'')}`;
export const formatDistance=(meters:number,units:'\''metric'\''|'\''imperial'\'')=>units==='\''metric'\''?`${(meters/1000).toFixed(2)} km`:`${(meters/1609.344).toFixed(2)} mi`;
export const pace=(meters:number,seconds:number,units:'\''metric'\''|'\''imperial'\'')=>{if(meters<10||seconds<=0)return'\''—'\'';const divisor=units==='\''metric'\''?1000:1609.344;const totalSeconds=Math.round(seconds/(meters/divisor));if(!Number.isFinite(totalSeconds)||totalSeconds>5999)return'\''—'\'';return `${Math.floor(totalSeconds/60)}:${String(totalSeconds%60).padStart(2,'\''0'\'')} /${units==='\''metric'\''?'\''km'\'':'\''mi'\''}`};
export const dateKey=(d=new Date())=>{const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'\''0'\'');const day=String(d.getDate()).padStart(2,'\''0'\'');return `${y}-${m}-${day}`};
export const calculateStreak=(activity:Record<string,DailyActivity>,goal:number,now=new Date())=>{let streak=0;const d=new Date(now);if((activity[dateKey(d)]?.steps??0)<goal)d.setDate(d.getDate()-1);while((activity[dateKey(d)]?.steps??0)>=goal){streak++;d.setDate(d.getDate()-1);}return streak;};
export const lastSevenDays=(activity:Record<string,DailyActivity>,now=new Date())=>Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-(6-i));return{date:dateKey(d),label:d.toLocaleDateString(undefined,{weekday:'\''short'\''}).slice(0,1),steps:activity[dateKey(d)]?.steps??0};});
export const aggregateWalk = (existing: DailyActivity | undefined, date: string, walk: { steps: number; distanceMeters: number; durationSeconds: number }): DailyActivity => ({ date, steps: Math.max(existing?.steps ?? 0, walk.steps), distanceMeters: Math.max(existing?.distanceMeters ?? 0, walk.distanceMeters), activeMinutes: (existing?.activeMinutes ?? 0) + Math.round(walk.durationSeconds / 60), calories: Math.max(existing?.calories ?? 0, caloriesFromSteps(walk.steps)), updatedAt: new Date().toISOString(), syncStatus: '\''local'\'' });
>>>>>>> theirs
