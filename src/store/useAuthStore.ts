import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  login: (username: string, password: string) => {
    set({ isLoading: true });
    // 模擬 API 請求延遲
    setTimeout(() => {
      if (username === password) {
        set({ isAuthenticated: true, user: username, isLoading: false });
        localStorage.setItem("userName", username);
      } else {
        set({ isLoading: false });
      }
    }, 1500);
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
    localStorage.removeItem("userName");
    window.location.href = "/"; // 改用這個方式
  },
}));
