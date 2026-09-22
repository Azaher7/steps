<<<<<<< ours
import React,{useState}from'react';import{StatusBar,useColorScheme,View,StyleSheet,Pressable,Text}from'react-native';import{SafeAreaProvider,SafeAreaView}from'react-native-safe-area-context';import{Ionicons}from'@expo/vector-icons';import{AppProvider,useApp}from'./src/context/AppContext';import{colors,resolveTheme}from'./src/theme';import{Loading}from'./src/components/UI';import{HomeScreen}from'./src/screens/HomeScreen';import{HistoryScreen}from'./src/screens/HistoryScreen';import{SettingsScreen}from'./src/screens/SettingsScreen';import{OnboardingScreen}from'./src/screens/OnboardingScreen';import{WalkScreen}from'./src/screens/WalkScreen';
type Tab='home'|'history'|'settings';
function Shell(){const{state,ready,completeOnboarding,addWalk}=useApp();const system=useColorScheme();const mode=resolveTheme(state.settings.theme,system);const c=colors[mode];const[tab,setTab]=useState<Tab>('home');const[walking,setWalking]=useState(false);if(!ready)return <Loading c={c}/>;if(!state.onboarded)return <OnboardingScreen c={c} onDone={completeOnboarding}/>;if(walking)return <WalkScreen c={c} units={state.settings.units} onClose={()=>setWalking(false)} onSave={w=>{addWalk(w);setWalking(false);setTab('history')}}/>;return <SafeAreaView style={[s.safe,{backgroundColor:c.bg}]} edges={['top']}><StatusBar barStyle={mode==='dark'?'light-content':'dark-content'}/><View style={s.page}>{tab==='home'?<HomeScreen c={c} onStart={()=>setWalking(true)}/>:tab==='history'?<HistoryScreen c={c}/>:<SettingsScreen c={c}/>}</View><View style={[s.tabs,{backgroundColor:c.surface,borderColor:c.line}]}>{([{id:'home',label:'Today',icon:'home'},{id:'history',label:'Activity',icon:'stats-chart'},{id:'settings',label:'Settings',icon:'options'}]as const).map(item=><Pressable accessibilityRole="tab" accessibilityState={{selected:tab===item.id}} onPress={()=>setTab(item.id)} style={s.tab} key={item.id}><Ionicons name={tab===item.id?item.icon:`${item.icon}-outline` as keyof typeof Ionicons.glyphMap} size={22} color={tab===item.id?c.primary:c.muted}/><Text style={[s.tabText,{color:tab===item.id?c.primary:c.muted}]}>{item.label}</Text></Pressable>)}</View></SafeAreaView>}
export default function App(){return <SafeAreaProvider><AppProvider><Shell/></AppProvider></SafeAreaProvider>}
const s=StyleSheet.create({safe:{flex:1},page:{flex:1},tabs:{position:'absolute',bottom:0,left:0,right:0,height:88,borderTopWidth:1,flexDirection:'row',paddingBottom:20},tab:{flex:1,alignItems:'center',justifyContent:'center',gap:5},tabText:{fontSize:10,fontWeight:'800'}});
=======
import React, { useEffect, useState } from '\''react'\'';
import { Pressable, StatusBar, StyleSheet, Text, useColorScheme, View } from '\''react-native'\'';
import { SafeAreaProvider, SafeAreaView } from '\''react-native-safe-area-context'\'';
import { LinearGradient } from '\''expo-linear-gradient'\'';
import { Ionicons } from '\''@expo/vector-icons'\'';
import { AppProvider, useApp } from '\''./src/context/AppContext'\'';
import { AuthProvider } from '\''./src/context/AuthContext'\'';
import { colors, resolveTheme } from '\''./src/theme'\'';
import { Loading } from '\''./src/components/UI'\'';
import { HomeScreen } from '\''./src/screens/HomeScreen'\'';
import { HistoryScreen } from '\''./src/screens/HistoryScreen'\'';
import { SettingsScreen } from '\''./src/screens/SettingsScreen'\'';
import { OnboardingScreen } from '\''./src/screens/OnboardingScreen'\'';
import { WalkScreen } from '\''./src/screens/WalkScreen'\'';
import { AccountScreen } from '\''./src/screens/AccountScreen'\'';
import { PrivacyScreen } from '\''./src/screens/PrivacyScreen'\'';
import { loadActiveWalk } from '\''./src/data/storage'\'';
import { useCloudSync } from '\''./src/hooks/useCloudSync'\'';

type Tab = '\''home'\'' | '\''history'\'' | '\''settings'\''; type Overlay = '\''walk'\'' | '\''account'\'' | '\''privacy'\'' | null;
function SyncAgent({ c }: { c: typeof colors.dark }) { const { status } = useCloudSync(); if (status === '\''idle'\'' || status === '\''synced'\'') return null; return <View pointerEvents="none" style={[s.sync, { backgroundColor: c.elevated }]}><Ionicons name={status === '\''offline'\'' ? '\''cloud-offline-outline'\'' : status === '\''error'\'' ? '\''warning-outline'\'' : '\''cloud-upload-outline'\''} size={13} color={status === '\''error'\'' ? c.danger : c.primary}/><Text style={{ color: c.muted, fontSize: 11, fontWeight: '\''700'\'' }}>{status === '\''offline'\'' ? '\''Offline · saved locally'\'' : status === '\''error'\'' ? '\''Sync paused · data is safe locally'\'' : '\''Syncing securely…'\''}</Text></View>; }
function Shell() {
  const { state, ready, completeOnboarding, addWalk } = useApp(); const system = useColorScheme(); const mode = resolveTheme(state.settings.theme, system); const c = colors[mode];
  const [tab, setTab] = useState<Tab>('\''home'\''); const [overlay, setOverlay] = useState<Overlay>(null);
  useEffect(() => { loadActiveWalk().then(active => { if (active) setOverlay('\''walk'\''); }); }, []);
  if (!ready) return <Loading c={c}/>;
  if (!state.onboarded) return <OnboardingScreen c={c} onDone={completeOnboarding}/>;
  if (overlay === '\''walk'\'') return <WalkScreen c={c} units={state.settings.units} haptics={state.settings.haptics} keepAwake={state.settings.keepScreenAwake} backgroundTracking={state.settings.backgroundTracking} onClose={() => setOverlay(null)} onSave={walk => { addWalk(walk); setOverlay(null); setTab('\''history'\''); }}/>
  if (overlay === '\''account'\'') return <AccountScreen c={c} onClose={() => setOverlay(null)}/>;
  if (overlay === '\''privacy'\'') return <PrivacyScreen c={c} onClose={() => setOverlay(null)}/>;
  return <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]} edges={['\''top'\'']}><StatusBar barStyle={mode === '\''dark'\'' ? '\''light-content'\'' : '\''dark-content'\''}/><SyncAgent c={c}/><View style={s.page}>{tab === '\''home'\'' ? <HomeScreen c={c} onStart={() => setOverlay('\''walk'\'')}/> : tab === '\''history'\'' ? <HistoryScreen c={c}/> : <SettingsScreen c={c} onAccount={() => setOverlay('\''account'\'')} onPrivacy={() => setOverlay('\''privacy'\'')}/>}</View><LinearGradient colors={[c.surface, c.surface2]} style={[s.tabs, { borderColor: c.line }]}>{([{ id: '\''home'\'', label: '\''Today'\'', icon: '\''home'\'' }, { id: '\''history'\'', label: '\''Activity'\'', icon: '\''stats-chart'\'' }, { id: '\''settings'\'', label: '\''Settings'\'', icon: '\''options'\'' }] as const).map(item => <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === item.id }} onPress={() => setTab(item.id)} style={s.tab} key={item.id}>{tab === item.id ? <LinearGradient colors={[c.primary, c.primary2]} style={s.selected}><Ionicons name={item.icon} size={20} color={c.primaryText}/></LinearGradient> : <Ionicons name={`${item.icon}-outline` as keyof typeof Ionicons.glyphMap} size={22} color={c.muted}/>}<Text style={[s.tabText, { color: tab === item.id ? c.primary : c.muted }]}>{item.label}</Text></Pressable>)}</LinearGradient></SafeAreaView>;
}
export default function App() { return <SafeAreaProvider><AuthProvider><AppProvider><Shell/></AppProvider></AuthProvider></SafeAreaProvider>; }
const s = StyleSheet.create({ safe: { flex: 1 }, page: { flex: 1 }, tabs: { position: '\''absolute'\'', bottom: 0, left: 0, right: 0, height: 92, borderTopWidth: 1, flexDirection: '\''row'\'', paddingBottom: 18 }, tab: { flex: 1, alignItems: '\''center'\'', justifyContent: '\''center'\'', gap: 3 }, selected: { width: 43, height: 31, borderRadius: 16, alignItems: '\''center'\'', justifyContent: '\''center'\'' }, tabText: { fontSize: 10, fontWeight: '\''800'\'' }, sync: { position: '\''absolute'\'', zIndex: 5, top: 10, alignSelf: '\''center'\'', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7, flexDirection: '\''row'\'', alignItems: '\''center'\'', gap: 6 } });
>>>>>>> theirs
