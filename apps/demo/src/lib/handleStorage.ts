import { HANDLE_STORAGE_KEY } from './constants';

export function readStoredHandle(): string | null {
  try {
    return window.localStorage.getItem(HANDLE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeHandle(handle: string | null) {
  try {
    if (handle) window.localStorage.setItem(HANDLE_STORAGE_KEY, handle);
    else window.localStorage.removeItem(HANDLE_STORAGE_KEY);
  } catch {}
}
