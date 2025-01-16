import { create } from "zustand";

interface ModelState {
  isDeepSeek: boolean;
  setIsDeepSeek: (isDeepSeek: boolean) => void;
}

export const useModelStore = create<ModelState>((set) => ({
  isDeepSeek: false,
  setIsDeepSeek: (isDeepSeek: boolean) => {
    set({ isDeepSeek });
  },
}));
