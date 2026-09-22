import { ColorSchemeName } from 'react-native';
import { ThemePreference } from './types';

export const tokens = {
  spacing: { xs: 6, sm: 10, md: 16, lg: 20, xl: 28, xxl: 36 },
  radius: { sm: 12, md: 18, lg: 24, xl: 32, pill: 999 },
  type: { display: 40, title: 30, heading: 20, body: 15, caption: 12 },
};
export const colors = {
  dark: { bg: '#07100C', surface: '#0E1A14', surface2: '#17271E', elevated: '#1B2E23', text: '#F3FAF5', muted: '#91A99B', primary: '#A7EE78', primary2: '#5BD5AD', primaryText: '#0B1A10', line: '#263A2E', danger: '#FF7E78', warning: '#F2C66D', map: '#101D17', shadow: '#000000' },
  light: { bg: '#F2F6F1', surface: '#FFFFFF', surface2: '#E8F0E9', elevated: '#FFFFFF', text: '#122019', muted: '#66796D', primary: '#5DAF35', primary2: '#21A987', primaryText: '#FFFFFF', line: '#D9E5DA', danger: '#D9514D', warning: '#AE7719', map: '#E4ECE5', shadow: '#193D29' },
};
export type Palette = typeof colors.dark;
export const gradients = {
  dark: { hero: ['#183524', '#0E1A14'] as const, primary: ['#B8F57E', '#58D3A9'] as const, ambient: ['#214833', '#07100C'] as const, danger: ['#FF8C7D', '#E65062'] as const },
  light: { hero: ['#FFFFFF', '#E6F3E8'] as const, primary: ['#77C947', '#25AE89'] as const, ambient: ['#D9F0DB', '#F2F6F1'] as const, danger: ['#EE7469', '#CD414E'] as const },
};
export type ThemeMode = keyof typeof colors;
export const resolveTheme = (preference: ThemePreference, system: ColorSchemeName): ThemeMode => preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
