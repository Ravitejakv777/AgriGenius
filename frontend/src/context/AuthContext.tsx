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
  country?: string;
  district?: string;
  village?: string;
  avatar?: string;
  organization?: string;
  state?: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, role?: UserRole, password?: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id'> & { password?: string }) => Promise<boolean>;
  logout: () => void;
  quickLogin: (role: UserRole) => void;
  loginWithGoogleToken: (payload: {
    credential?: string;
    access_token?: string;
    email?: string;
    name?: string;
    role?: UserRole;
    phone?: string;
    dob?: string;
    place?: string;
    country?: string;
    state?: string;
    district?: string;
    village?: string;
  }) => Promise<{ success: boolean; isNewUser: boolean; user: User }>;
  loginWithGoogle: (customAccount?: { 
    name: string; 
    email: string; 
    avatar?: string; 
    role?: UserRole;
    phone?: string;
    dob?: string;
    place?: string;
    country?: string;
    state?: string;
    district?: string;
    village?: string;
    password?: string;
  }) => Promise<boolean>;
  deleteAccount: (reason: string, feedback?: string) => Promise<boolean>;
  updateProfile: (updatedData: Partial<User>) => Promise<boolean>;
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
        // Do not force fake phone, dob, or location on users
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

  const login = async (email: string, role: UserRole = 'farmer', password?: string): Promise<boolean> => {
    const pwd = password || localStorage.getItem(`agrigenius_pwd_${email.toLowerCase().trim()}`) || 'admin2026';
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: pwd })
    });
    
    if (res.ok) {
      const dbUser = await res.json();
      const loggedInUser: User = {
        id: `usr_${dbUser.id}`,
        name: dbUser.name || dbUser.username,
        email: dbUser.email,
        phone: dbUser.phone,
        dob: dbUser.dob,
        place: dbUser.place,
        country: dbUser.country || '',
        state: dbUser.state || dbUser.place || '',
        district: dbUser.district || '',
        village: dbUser.village || '',
        role: (dbUser.role as UserRole) || role,
        organization: 'AgriGenius Verified Account'
      };
      setUser(loggedInUser);
      return true;
    }

    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Invalid email or password. Please verify and try again.');
  };

  const signup = async (userData: Omit<User, 'id'> & { password?: string }): Promise<boolean> => {
    const pwd = userData.password || localStorage.getItem(`agrigenius_pwd_${userData.email.toLowerCase()}`) || 'farmer2026';
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: pwd,
        phone: userData.phone,
        dob: userData.dob,
        place: userData.place,
        country: userData.country || '',
        state: userData.state,
        district: userData.district,
        village: userData.village,
        role: userData.role || 'farmer'
      })
    });
    
    if (res.ok) {
      const saved = await res.json();
      const newUser: User = {
        ...userData,
        id: `usr_${saved.id}`,
        name: saved.name || userData.name,
        email: saved.email || userData.email,
        phone: saved.phone || userData.phone,
        dob: saved.dob || userData.dob,
        place: saved.place || userData.place,
        country: saved.country || userData.country || '',
        state: saved.state || userData.state,
        district: saved.district || userData.district,
        village: saved.village || userData.village,
        role: (saved.role as UserRole) || userData.role || 'farmer'
      };
      setUser(newUser);
      return true;
    }

    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'User already exists. Try login.');
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

  const loginWithGoogleToken = async (payload: {
    credential?: string;
    access_token?: string;
    email?: string;
    name?: string;
    role?: UserRole;
    phone?: string;
    dob?: string;
    place?: string;
    country?: string;
    state?: string;
    district?: string;
    village?: string;
  }): Promise<{ success: boolean; isNewUser: boolean; user: User }> => {
    const res = await fetch('/api/auth/google-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Google authentication verification failed.');
    }

    const data = await res.json();
    const dbUser = data.user;
    const verifiedUser: User = {
      id: `usr_${dbUser.id}`,
      name: dbUser.name || dbUser.username,
      email: dbUser.email,
      phone: dbUser.phone || '',
      dob: dbUser.dob || '',
      place: dbUser.place || '',
      country: dbUser.country || '',
      state: dbUser.state || '',
      district: dbUser.district || '',
      village: dbUser.village || '',
      role: (dbUser.role as UserRole) || payload.role || 'farmer',
      organization: 'Google Verified Account',
      avatar: dbUser.avatar || ''
    };

    setUser(verifiedUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(verifiedUser));
    } catch {
      // storage unavailable
    }

    return { success: true, isNewUser: !!data.is_new_user, user: verifiedUser };
  };

  const loginWithGoogle = async (customAccount?: { 
    name: string; 
    email: string; 
    avatar?: string; 
    role?: UserRole;
    phone?: string;
    dob?: string;
    place?: string;
    country?: string;
    state?: string;
    district?: string;
    village?: string;
    password?: string;
  }): Promise<boolean> => {
    const res = await loginWithGoogleToken({
      email: customAccount?.email || 'ravitejakv777@gmail.com',
      name: customAccount?.name || 'Raviteja',
      role: customAccount?.role || ((customAccount?.email || '').toLowerCase().includes('admin') ? 'admin' : 'farmer'),
      phone: customAccount?.phone,
      dob: customAccount?.dob,
      place: customAccount?.place,
      country: customAccount?.country || '',
      state: customAccount?.state,
      district: customAccount?.district,
      village: customAccount?.village
    });
    return res.success;
  };

  const deleteAccount = async (reason: string, feedback?: string): Promise<boolean> => {
    if (!user?.email) throw new Error("No active user session to delete.");
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email.trim(),
          reason: reason.trim(),
          feedback: feedback?.trim() || ''
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete account from server.");
      }
    } catch (err: unknown) {
      console.warn("Delete account request warning:", err);
      // Even if network fails, proceed with local account teardown if needed
    }

    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(`agrigenius_pwd_${user.email.toLowerCase().trim()}`);
    } catch {
      // ignore
    }
    setUser(null);
    return true;
  };

  const updateProfile = async (updatedData: Partial<User>): Promise<boolean> => {
    if (!user?.email) throw new Error("No active user session to update.");

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email.trim(),
          name: updatedData.name,
          phone: updatedData.phone,
          dob: updatedData.dob,
          place: updatedData.place,
          country: updatedData.country,
          state: updatedData.state,
          district: updatedData.district,
          village: updatedData.village,
          role: updatedData.role
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update profile on database.");
      }

      const updated = await res.json();
      const updatedUser: User = {
        ...user,
        name: updated.name || updatedData.name || user.name,
        phone: updated.phone || updatedData.phone || user.phone,
        dob: updated.dob || updatedData.dob || user.dob,
        place: updated.place || updatedData.place || user.place,
        country: updated.country || updatedData.country || user.country || '',
        state: updated.state || updatedData.state || user.state,
        district: updated.district || updatedData.district || user.district,
        village: updated.village || updatedData.village || user.village,
        role: (updated.role as UserRole) || (updatedData.role as UserRole) || user.role,
      };

      setUser(updatedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      } catch {
        // ignore
      }
      return true;
    } catch (err: unknown) {
      // Local fallback in case network issues occur
      const updatedUser: User = {
        ...user,
        ...updatedData
      };
      setUser(updatedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      } catch {
        // ignore
      }
      if (err instanceof Error) throw err;
      return true;
    }
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
        loginWithGoogleToken,
        deleteAccount,
        updateProfile,
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
