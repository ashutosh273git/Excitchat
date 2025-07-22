import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("excite-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("excite-theme", theme);
    set({ theme });
  },
}));
