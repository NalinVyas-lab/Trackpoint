import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('malca-theme');
      return saved !== null ? saved === 'dark' : true;
    } catch (_e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('malca-theme', isDark ? 'dark' : 'light');
    } catch (_e) {}
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useTC() {
  const { isDark } = useTheme();
  return {
    isDark,
    // accent hex values for inline styles
    accent: isDark ? '#DAF1DE' : '#0B2B26',
    accentMuted: isDark ? 'rgba(218,241,222,0.15)' : 'rgba(11,43,38,0.12)',
    accentFaint: isDark ? 'rgba(218,241,222,0.07)' : 'rgba(11,43,38,0.06)',
    accentBorder: isDark ? 'rgba(218,241,222,0.25)' : 'rgba(11,43,38,0.22)',

    pageBg: isDark
      ? 'bg-gradient-to-br from-[#040f0d] via-[#0B2B26] to-[#0d3329]'
      : 'bg-gradient-to-br from-[#DAF1DE] via-[#c5e8cb] to-[#b2deba]',
    cardBg: isDark
      ? 'bg-gradient-to-b from-[#0f2e28] to-[#0a2420]'
      : 'bg-gradient-to-b from-white to-[#edf8ef]',
    innerBg: isDark ? 'bg-[#0a2018]' : 'bg-[#e8f5ea]',
    headerBg: isDark
      ? 'bg-[#091e1a] border-[#163d36]'
      : 'bg-[#DAF1DE] border-[#a5d8ae]',
    tableHeaderBg: isDark ? 'bg-[#0a2018]' : 'bg-[#c8ecd0]',
    hoverBg: isDark ? 'hover:bg-[#0f2e28]' : 'hover:bg-[#d4f0d9]',
    border: isDark ? 'border-[#163d36]' : 'border-[#a5d8ae]',
    divider: isDark ? 'divide-[#163d36]' : 'divide-[#a5d8ae]',
    text: isDark ? 'text-[#DAF1DE]' : 'text-[#0B2B26]',
    subtext: isDark ? 'text-[#6fa894]' : 'text-[#2e6b5e]',
    inputBg: isDark
      ? 'bg-[#0a2018] border-[#163d36] text-[#DAF1DE] placeholder:text-[#3d7a6a]'
      : 'bg-white border-[#a5d8ae] text-[#0B2B26] placeholder:text-[#7ab89c]',
    tooltipStyle: isDark
      ? { backgroundColor: '#0f2e28', border: '1px solid #163d36', borderRadius: '8px', color: '#DAF1DE' }
      : { backgroundColor: '#ffffff', border: '1px solid #a5d8ae', borderRadius: '8px', color: '#0B2B26' },
    navItemInactive: isDark
      ? 'text-[#6fa894] hover:text-[#DAF1DE] hover:bg-[#163d36]'
      : 'text-[#2e6b5e] hover:text-[#0B2B26] hover:bg-[#b8e4c4]',
    secondaryBtn: isDark
      ? 'bg-[#163d36] hover:bg-[#1d4d44] text-[#DAF1DE]'
      : 'bg-[#b8e4c4] hover:bg-[#a5d8ae] text-[#0B2B26]',
    mapOcean: isDark ? '#030d0b' : '#c5e8cb',
    mapLand: isDark ? '#163d36' : '#0B2B26',
    mapLandStroke: isDark ? '#1d4d44' : '#0a2420',
    mapGrid: isDark ? '#DAF1DE' : '#0B2B26',
  };
}
