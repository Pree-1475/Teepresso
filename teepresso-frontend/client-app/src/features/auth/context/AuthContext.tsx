'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'customer' | 'admin' | 'manager' | 'editing_team';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, role?: UserRole) => User;
  register: (name: string, email: string, phone: string) => User;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load saved session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('teepresso_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const login = (emailOrPhone: string, role: UserRole = 'customer'): User => {
    let name = 'Rahul Sharma';
    let phone = '9876543210';
    let email = 'rahul@example.com';

    if (role === 'admin') {
      name = 'Admin Director';
      email = 'admin@teepresso.com';
    } else if (role === 'manager') {
      name = 'Operations Manager';
      email = 'manager@teepresso.com';
    } else if (role === 'editing_team') {
      name = 'Editing Team Lead';
      email = 'editing@teepresso.com';
    } else if (emailOrPhone.includes('@')) {
      email = emailOrPhone;
      name = emailOrPhone.split('@')[0];
    } else if (emailOrPhone.length >= 10) {
      phone = emailOrPhone;
    }

    const newUser: User = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      phone,
      role,
    };

    setUser(newUser);
    try {
      localStorage.setItem('teepresso_user', JSON.stringify(newUser));
    } catch {
      // Ignore storage errors
    }

    return newUser;
  };

  const register = (name: string, email: string, phone: string): User => {
    const newUser: User = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      phone,
      role: 'customer',
    };

    setUser(newUser);
    try {
      localStorage.setItem('teepresso_user', JSON.stringify(newUser));
    } catch {
      // Ignore storage errors
    }

    return newUser;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('teepresso_user');
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
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
