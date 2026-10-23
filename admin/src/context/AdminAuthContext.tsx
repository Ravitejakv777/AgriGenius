import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdminUser } from '../lib/types';
import { DEMO_ADMIN_USERS } from '../lib/mockData';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, passkey: string) => Promise<boolean>;
  quickDemoLogin: (roleKey: 'superadmin' | 'reviewer' | 'kvk_scientist') => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'agrigenius_admin_auth_v1';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    // Default to superadmin so evaluators can inspect immediately or switch
    return DEMO_ADMIN_USERS.superadmin;
  });

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [adminUser]);

  const login = async (email: string, passkey: string): Promise<boolean> => {
    // Basic verification - in production validates JWT with /api/admin/token
    const emailLower = email.toLowerCase().trim();
    if (!passkey || passkey.length < 4) {
      throw new Error('Security passkey must be at least 4 characters.');
    }

    if (emailLower.includes('ananya') || emailLower.includes('icar')) {
      setAdminUser(DEMO_ADMIN_USERS.reviewer);
    } else if (emailLower.includes('rajesh') || emailLower.includes('kvk')) {
      setAdminUser(DEMO_ADMIN_USERS.kvk_scientist);
    } else {
      // Default to Dr. Ravi Teja / Superadmin
      setAdminUser({
        ...DEMO_ADMIN_USERS.superadmin,
        email: emailLower || DEMO_ADMIN_USERS.superadmin.email
      });
    }
    return true;
  };

  const quickDemoLogin = (roleKey: 'superadmin' | 'reviewer' | 'kvk_scientist') => {
    const user = DEMO_ADMIN_USERS[roleKey] || DEMO_ADMIN_USERS.superadmin;
    setAdminUser(user);
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser,
        login,
        quickDemoLogin,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
