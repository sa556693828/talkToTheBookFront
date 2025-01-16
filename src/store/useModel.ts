import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ModelState {
  isDeepSeek: boolean;
  setIsDeepSeek: (isDeepSeek: boolean) => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      isDeepSeek: false,
      setIsDeepSeek: (isDeepSeek: boolean) => set({ isDeepSeek }),
    }),
    {
      name: "model-storage",
    }
  )
);
