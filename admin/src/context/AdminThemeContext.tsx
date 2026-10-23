import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface AdminThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('agrigenius_admin_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark'; // Admin dashboard defaults to sleek dark mode
  });

  useEffect(() => {
    localStorage.setItem('agrigenius_admin_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}
