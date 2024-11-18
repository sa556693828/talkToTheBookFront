import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  login: async (username: string, password: string) => {
    set({ isLoading: true });
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === password) {
          set({ isAuthenticated: true, user: username, isLoading: false });
          localStorage.setItem("userName", username);
          resolve(true);
        } else {
          set({ isLoading: false });
          resolve(false);
        }
      }, 1500);
    });
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
    localStorage.removeItem("userName");
    window.location.href = "/"; // 改用這個方式
  },
}));
