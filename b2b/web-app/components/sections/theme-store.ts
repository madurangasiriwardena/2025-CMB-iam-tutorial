import { create } from 'zustand';

interface ThemeStore {
  primaryColor: string;
  secondaryColor: string;
  setColors: (primary: string, secondary: string) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  // Defaults match the values from custom-theme.less
  primaryColor: '#6672c6',
  secondaryColor: '#aed3f6',
  setColors: (primary, secondary) => set({ primaryColor: primary, secondaryColor: secondary })
}));
