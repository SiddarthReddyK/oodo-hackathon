import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types/inventory';
import { INITIAL_USERS } from '../data/initialData';
import { api, setAuthToken, getAuthToken } from '../services/apiClient';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isDexterAccount: boolean;
  isAlexAccount: boolean;
  isLoading: boolean;
  login: (emailOrLoginId: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, role: UserRole, warehouseId: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  availableUsers: User[];
  // OTP Password Reset Flow
  requestPasswordResetOtp: (email: string) => Promise<{ success: boolean; simulatedOtp: string }>;
  verifyOtpAndResetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'stocksense_auth_user_v2';
const USERS_STORAGE_KEY = 'stocksense_registered_users_v2';

export const checkIsDexterAccount = (user: User | null): boolean => {
  if (!user) return false;
  const name = user.name.toLowerCase();
  const email = user.email.toLowerCase();
  return (
    user.id === 'usr-1' ||
    name.includes('dexter') ||
    email.includes('dexter') ||
    name.includes('alex') ||
    email.includes('alex')
  );
};

export const checkIsAlexAccount = checkIsDexterAccount;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse stored users', e);
      }
    }
    return INITIAL_USERS;
  });

  // Always boot into /login when there is no valid session or token
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const token = getAuthToken();
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null; // Boot into login by default if no valid token
  });

  const logout = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
  }, []);

  // Validate session on boot if token exists
  useEffect(() => {
    const verifySession = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.get<{ user: User }>('/api/auth/me');
        if (data && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [logout]);

  // Listen for unauthorized 401 events anywhere in the app
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('stocksense:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('stocksense:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const login = async (identifier: string, password?: string): Promise<boolean> => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return false;

    try {
      const response = await api.post<{ token: string; user: User }>('/api/auth/login', {
        emailOrLoginId: clean,
        password: password || 'Stocksense2026!'
      });

      if (response && response.token && response.user) {
        setAuthToken(response.token);
        setCurrentUser(response.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response.user));
        return true;
      }
    } catch (err) {
      console.warn('Backend login attempt failed, trying fallback local accounts:', err);
      // Fallback for offline demo simulation
      const user = users.find(u => {
        const email = u.email.toLowerCase();
        const name = u.name.toLowerCase();
        const slug = name.replace(/\s+/g, '.');
        const emailPrefix = email.split('@')[0];
        return (
          email === clean ||
          name === clean ||
          slug === clean ||
          emailPrefix === clean ||
          (!clean.includes('@') && email === `${clean}@stocksense.io`)
        );
      });

      if (user) {
        // If server was unreachable, generate a fallback local token
        setAuthToken('demo-session-token-' + Date.now());
        setCurrentUser(user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        return true;
      }
    }

    return false;
  };

  const signup = async (
    name: string,
    email: string,
    role: UserRole,
    warehouseId: string
  ): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      const response = await api.post<{ token: string; user: User }>('/api/auth/register', {
        name: cleanName,
        email: cleanEmail,
        role,
        warehouseId: warehouseId || 'wh-northdock'
      });

      if (response && response.token && response.user) {
        setAuthToken(response.token);
        setCurrentUser(response.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response.user));
        setUsers(prev => {
          const exists = prev.some(u => u.id === response.user.id);
          return exists ? prev : [...prev, response.user];
        });
        return true;
      }
    } catch (err) {
      console.warn('Backend register failed, trying fallback local registration:', err);
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role,
        title: role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff',
        warehouseId: warehouseId || 'wh-northdock',
        avatarUrl: '/src/assets/images/stocksense_user_avatar_1790401027960.jpg'
      };

      setAuthToken('demo-session-token-' + Date.now());
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      return true;
    }

    return false;
  };

  const switchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    if (!checkIsDexterAccount(currentUser)) {
      console.warn('Role switching is reserved for the Dexter Morgan demo account.');
      return;
    }

    const updated: User = {
      ...currentUser,
      role: newRole,
      title: newRole === 'inventory_manager' ? 'Operations lead' : 'Warehouse Specialist'
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  const switchUser = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      await login(target.email);
    }
  };

  const requestPasswordResetOtp = async (email: string): Promise<{ success: boolean; simulatedOtp: string }> => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await new Promise(r => setTimeout(r, 350));
    return { success: true, simulatedOtp: generatedOtp };
  };

  const verifyOtpAndResetPassword = async (
    email: string,
    otp: string,
    _newPassword: string
  ): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 300));
    if (otp && otp.length === 6) {
      const clean = email.trim().toLowerCase();
      const user =
        users.find(u => u.email.toLowerCase() === clean) ||
        users.find(u => u.name.toLowerCase().replace(/\s+/g, '.') === clean) ||
        users[0];
      if (user) {
        return login(user.email);
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isDexterAccount: checkIsDexterAccount(currentUser),
        isAlexAccount: checkIsDexterAccount(currentUser),
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        switchUser,
        availableUsers: users,
        requestPasswordResetOtp,
        verifyOtpAndResetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
