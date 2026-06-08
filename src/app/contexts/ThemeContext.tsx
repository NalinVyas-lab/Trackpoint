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
    pageBg: isDark ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f5]',
    cardBg: isDark ? 'bg-[#242424]' : 'bg-white',
    innerBg: isDark ? 'bg-[#1a1a1a]' : 'bg-[#f8f8f8]',
    headerBg: isDark ? 'bg-[#242424] border-[#333333]' : 'bg-white border-[#e5e5e5]',
    tableHeaderBg: isDark ? 'bg-[#1f1f1f]' : 'bg-[#f3f3f3]',
    hoverBg: isDark ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#fafafa]',
    border: isDark ? 'border-[#333333]' : 'border-[#e5e5e5]',
    divider: isDark ? 'divide-[#333333]' : 'divide-[#e5e5e5]',
    text: isDark ? 'text-[#e5e5e5]' : 'text-[#1a1a1a]',
    subtext: isDark ? 'text-[#999999]' : 'text-[#666666]',
    inputBg: isDark
      ? 'bg-[#1a1a1a] border-[#333333] text-[#e5e5e5] placeholder:text-[#666666]'
      : 'bg-white border-[#d5d5d5] text-[#1a1a1a] placeholder:text-[#aaaaaa]',
    tooltipStyle: isDark
      ? { backgroundColor: '#242424', border: '1px solid #333333', borderRadius: '8px', color: '#e5e5e5' }
      : { backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px', color: '#1a1a1a' },
    navItemInactive: isDark
      ? 'text-[#999999] hover:text-[#e5e5e5] hover:bg-[#333333]'
      : 'text-[#666666] hover:text-[#1a1a1a] hover:bg-[#f0f0f0]',
    secondaryBtn: isDark
      ? 'bg-[#333333] hover:bg-[#3a3a3a] text-[#e5e5e5]'
      : 'bg-[#e8e8e8] hover:bg-[#e0e0e0] text-[#1a1a1a]',
    mapOcean: isDark ? '#0d0d0d' : '#dbeafe',
    mapLand: isDark ? '#2a2a2a' : '#d1d5db',
    mapLandStroke: isDark ? '#333333' : '#b0b7c0',
    mapGrid: isDark ? '#BAAB48' : '#BAAB48',
  };
}
