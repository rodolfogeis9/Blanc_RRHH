import { AuthState } from '../context/AuthContext';

const STORAGE_KEY = 'blanc_rrhh_auth';

export const storeToken = (auth: AuthState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
};

export const getStoredToken = (): AuthState | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error parsing auth storage', error);
    return null;
  }
};

export const removeStoredToken = () => localStorage.removeItem(STORAGE_KEY);
