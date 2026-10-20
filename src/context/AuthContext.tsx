import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { login as apiLogin, logout as apiLogout, getCurrentUser, LoginCredentials } from '../api/auth';
import { DEMO_USERS } from '../api/mockData';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const stored = await getCurrentUser();
        if (stored) {
          setUser(stored);
        } else {
          // Default to ADMIN for instant demonstration ease if not logged in
          const defaultAdmin = DEMO_USERS.ADMIN;
          setUser(defaultAdmin);
          localStorage.setItem('twsela_user', JSON.stringify(defaultAdmin));
          localStorage.setItem('twsela_token', 'mock-admin-token');
          localStorage.setItem('twsela_tenant_id', defaultAdmin.tenantId);
        }
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();

    const handleExpired = () => {
      setUser(null);
    };
    window.addEventListener('twsela_auth_expired', handleExpired);
    return () => window.removeEventListener('twsela_auth_expired', handleExpired);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const resp = await apiLogin(credentials);
      setUser(resp.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const targetUser = DEMO_USERS[role] || DEMO_USERS.ADMIN;
      setUser(targetUser);
      localStorage.setItem('twsela_user', JSON.stringify(targetUser));
      localStorage.setItem('twsela_token', `mock-${role.toLowerCase()}-token`);
      localStorage.setItem('twsela_tenant_id', targetUser.tenantId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
