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
    accent: '#BAAB48',
    accentMuted: 'rgba(186,171,72,0.15)',
    accentFaint: 'rgba(186,171,72,0.07)',
    accentBorder: 'rgba(186,171,72,0.3)',

    pageBg: isDark ? 'bg-[#111111]' : 'bg-[#f4f5f7]',
    cardBg: isDark ? 'bg-[#1c1c1c]' : 'bg-white',
    innerBg: isDark ? 'bg-[#141414]' : 'bg-[#f8f9fa]',
    headerBg: isDark ? 'bg-[#1c1c1c] border-[#2a2a2a]' : 'bg-white border-[#e8e8e8]',
    tableHeaderBg: isDark ? 'bg-[#171717]' : 'bg-[#f8f9fa]',
    hoverBg: isDark ? 'hover:bg-[#232323]' : 'hover:bg-[#fafafa]',
    border: isDark ? 'border-[#2a2a2a]' : 'border-[#e8e8e8]',
    divider: isDark ? 'divide-[#2a2a2a]' : 'divide-[#e8e8e8]',
    text: isDark ? 'text-[#e8e8e8]' : 'text-[#111111]',
    subtext: isDark ? 'text-[#888888]' : 'text-[#666666]',
    inputBg: isDark
      ? 'bg-[#141414] border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555]'
      : 'bg-white border-[#e0e0e0] text-[#111111] placeholder:text-[#aaaaaa]',
    tooltipStyle: isDark
      ? { backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e8e8e8', fontSize: '12px' }
      : { backgroundColor: '#ffffff', border: '1px solid #e8e8e8', borderRadius: '8px', color: '#111111', fontSize: '12px' },
    navItemInactive: isDark
      ? 'text-[#888888] hover:text-[#e8e8e8] hover:bg-[#2a2a2a]'
      : 'text-[#666666] hover:text-[#111111] hover:bg-[#f0f0f0]',
    secondaryBtn: isDark
      ? 'bg-[#2a2a2a] hover:bg-[#333333] text-[#e8e8e8]'
      : 'bg-[#f0f0f0] hover:bg-[#e8e8e8] text-[#111111]',
    mapOcean: isDark ? '#0a0f1a' : '#dbeafe',
    mapLand: isDark ? '#1c2333' : '#d1d5db',
    mapLandStroke: isDark ? '#2a3040' : '#b0b7c0',
    mapGrid: '#BAAB48',
  };
}
