import { create } from 'zustand';

const DEFAULT_PRIMARY_COLOR = '#6672c6';
const DEFAULT_SECONDARY_COLOR = '#0a345c';

interface ThemeStore {
  primaryColor: string;
  secondaryColor: string;
  setColors: (primary: string, secondary: string) => void;
  resetColors: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  primaryColor: DEFAULT_PRIMARY_COLOR,
  secondaryColor: DEFAULT_SECONDARY_COLOR,
  setColors: (primary, secondary) => set({ primaryColor: primary, secondaryColor: secondary }),
  resetColors: () => set({
    primaryColor: DEFAULT_PRIMARY_COLOR,
    secondaryColor: DEFAULT_SECONDARY_COLOR
  }),
}));
