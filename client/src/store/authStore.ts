import { create } from "zustand";
import type { PublicUser } from "@devconnect/shared";

interface AuthState {
  user: PublicUser | null;
  initialized: boolean;
  setUser: (user: PublicUser | null) => void;
  setInitialized: (v: boolean) => void;
}

/**
 * Holds the currently logged-in user client-side (client-only UI state).
 * The source of truth is always the server session (httpOnly cookie);
 * this store just avoids re-fetching /auth/me on every render.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  setUser: (user) => set({ user }),
  setInitialized: (v) => set({ initialized: v }),
}));
