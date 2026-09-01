'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  setUserSession: (user: CustomerUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);

  // Load saved customer session on mount (isolated from admin console)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('teepresso_customer_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setUserSession = (userData: CustomerUser) => {
    setUser(userData);
    try {
      localStorage.setItem('teepresso_customer_user', JSON.stringify(userData));
    } catch {
      // Ignore storage errors
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('teepresso_customer_user');
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        setUserSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
