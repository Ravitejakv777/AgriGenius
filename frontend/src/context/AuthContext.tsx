import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'farmer' | 'agronomist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  dob?: string;
  place?: string;
  avatar?: string;
  organization?: string;
  state?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  signup: (userData: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  quickLogin: (role: UserRole) => void;
  loginWithGoogle: (customAccount?: { 
    name: string; 
    email: string; 
    avatar?: string; 
    role?: UserRole;
    phone?: string;
    dob?: string;
    place?: string;
  }) => Promise<boolean>;
}

const DEMO_ACCOUNTS: Record<UserRole, User> = {
  admin: {
    id: 'usr_admin_01',
    name: 'Dr. Ravi Teja',
    email: 'admin@agrigenius.gov.in',
    role: 'admin',
    phone: '+91 98765 43210',
    dob: '15/08/1995',
    place: 'Delhi, India',
    organization: 'National Agricultural AI Directorate',
    state: 'Delhi (HQ)',
    avatar: ''
  },
  farmer: {
    id: 'usr_farmer_02',
    name: 'Raviteja',
    email: 'ravitejakv777@gmail.com',
    role: 'farmer',
    phone: '+91 98765 43210',
    dob: '15/08/1995',
    place: 'Andhra Pradesh, India',
    organization: 'Independent Farm',
    state: 'Andhra Pradesh',
    avatar: ''
  },
  agronomist: {
    id: 'usr_agro_03',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@icar.gov.in',
    role: 'agronomist',
    phone: '+91 98450 11234',
    dob: '22/04/1992',
    place: 'Pune, Maharashtra',
    organization: 'ICAR Krishi Vigyan Kendra',
    state: 'Maharashtra (Pune)',
    avatar: ''
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'agrigenius_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.avatar && parsed.avatar.includes('unsplash.com')) {
          parsed.avatar = '';
        }
        if (!parsed.phone) parsed.phone = '+91 98765 43210';
        if (!parsed.dob) parsed.dob = '15/08/1995';
        if (!parsed.place) parsed.place = parsed.state || 'Andhra Pradesh, India';
        return parsed;
      }
    } catch {
      // ignore JSON parse error
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // storage unavailable
    }
  }, [user]);

  const login = async (email: string, role: UserRole = 'farmer'): Promise<boolean> => {
    // In our client-side prototype, check if matching demo or synthesize
    const normalized = email.toLowerCase().trim();
    if (normalized.includes('admin')) {
      setUser(DEMO_ACCOUNTS.admin);
      return true;
    }
    if (normalized.includes('agro') || normalized.includes('icar')) {
      setUser(DEMO_ACCOUNTS.agronomist);
      return true;
    }
    
    // Synthesize user with selected role
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role,
      state: 'All India',
      organization: role === 'admin' ? 'KCC Administration' : 'Independent Farm',
    };
    setUser(newUser);
    return true;
  };

  const signup = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // storage unavailable
    }
    setUser(null);
  };

  const quickLogin = (role: UserRole) => {
    setUser(DEMO_ACCOUNTS[role]);
  };

  const loginWithGoogle = async (customAccount?: { 
    name: string; 
    email: string; 
    avatar?: string; 
    role?: UserRole;
    phone?: string;
    dob?: string;
    place?: string;
  }): Promise<boolean> => {
    const isTargetAdmin = (customAccount?.email || '').toLowerCase().includes('admin');
    const role: UserRole = customAccount?.role || (isTargetAdmin ? 'admin' : 'farmer');
    
    const googleUser: User = {
      id: `usr_google_${Date.now()}`,
      name: customAccount?.name || 'Raviteja',
      email: customAccount?.email || 'ravitejakv777@gmail.com',
      role,
      phone: customAccount?.phone || '+91 98765 43210',
      dob: customAccount?.dob || '15/08/1995',
      place: customAccount?.place || 'Andhra Pradesh, India',
      organization: 'Google Verified Account',
      state: customAccount?.place || 'Andhra Pradesh',
      avatar: ''
    };
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(googleUser));
    } catch {
      // storage unavailable
    }
    setUser(googleUser);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        quickLogin,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
