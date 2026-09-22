import type { ExpoConfig, ConfigContext } from 'expo/config';
import app from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = app.expo as ExpoConfig;
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  return {
    ...config,
    ...base,
    android: {
      ...base.android,
      ...(googleMapsApiKey ? { config: { googleMaps: { apiKey: googleMapsApiKey } } } : {}),
    },
  };
};
