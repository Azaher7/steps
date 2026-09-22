import { ColorSchemeName } from 'react-native';
import { ThemePreference } from './types';
export const colors={dark:{bg:'#0A0F0D',surface:'#121A16',surface2:'#19241E',text:'#F4F8F5',muted:'#90A097',primary:'#B8F36B',primaryText:'#16200E',line:'#26332C',danger:'#FF766F',map:'#18211D'},light:{bg:'#F4F6F2',surface:'#FFFFFF',surface2:'#EAF0E9',text:'#142018',muted:'#68756D',primary:'#72B52C',primaryText:'#FFFFFF',line:'#DDE5DD',danger:'#D84F4A',map:'#E6EDE6'}};
export type Palette=typeof colors.dark;
export const resolveTheme=(preference:ThemePreference,system:ColorSchemeName)=>preference==='system'?(system==='dark'?'dark':'light'):preference;
