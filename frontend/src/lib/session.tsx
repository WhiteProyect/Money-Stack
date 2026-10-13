'use client';

// Estado de sesión en el cliente: el access token vive solo en memoria
// (src/lib/api.ts) y la sesión se restaura al montar con la cookie de refresh.

import { useEffect, useSyncExternalStore } from 'react';
import {
  getSessionState,
  restoreSession,
  subscribeSession,
  type SessionState,
} from './api';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void restoreSession();
  }, []);

  return <>{children}</>;
}

export function useSession(): SessionState {
  return useSyncExternalStore(
    subscribeSession,
    getSessionState,
    getSessionState
  );
}
