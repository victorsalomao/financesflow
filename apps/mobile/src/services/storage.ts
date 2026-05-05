import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UsuarioData, DomicilioInfo } from '../context/AuthContext';

const AUTH_KEY = '@financeflow:auth';

export interface StoredAuth {
  token: string;
  usuario: UsuarioData;
  domicilio: DomicilioInfo | null;
  savedAt: number;
}

export async function saveAuth(auth: Omit<StoredAuth, 'savedAt'>): Promise<void> {
  const payload: StoredAuth = { ...auth, savedAt: Date.now() };
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(payload));
}

export async function loadAuth(): Promise<StoredAuth | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    // Sanity check: descarta se faltar algum campo essencial
    if (!parsed.token || !parsed.usuario) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}
