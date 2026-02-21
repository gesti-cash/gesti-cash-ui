import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthTokens } from "../types";

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setTokens: (tokens) => set({ tokens }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      login: (user, tokens) => set({ 
        user, 
        tokens, 
        isAuthenticated: true,
        isLoading: false 
      }),
      
      logout: () => set({ 
        user: null, 
        tokens: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hooks utilitaires
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthTokens = () => useAuthStore((state) => state.tokens);
