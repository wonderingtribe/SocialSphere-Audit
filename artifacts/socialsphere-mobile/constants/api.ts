import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resolves the base URL for the SocialSphere API.
 *
 * The generated client always requests paths like "/api/leads", so this value
 * must be an ORIGIN ONLY (scheme + host[:port]) — never include the "/api"
 * path, or requests would be double-prefixed.
 *
 * Precedence:
 * 1. EXPO_PUBLIC_API_URL (explicit, recommended for release builds)
 * 2. Web: "" (same-origin — the web build and API are served together)
 * 3. Native dev: the Expo dev server host on port 5000, so a physical device
 *    running Expo Go can reach the API running on the same machine.
 *
 * The app degrades gracefully to its offline demo dataset when the API is
 * unreachable, so an unavailable default never bricks the UI.
 */
const DEV_API_PORT = '5000';

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/+$/, '');

  if (Platform.OS === 'web') {
    return '';
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0] || 'localhost';
  return `http://${host}:${DEV_API_PORT}`;
}