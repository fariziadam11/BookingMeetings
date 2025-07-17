import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any;
  isAdmin: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any } | undefined>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.user_id, role: payload.role });
        setIsAdmin(payload.role === 'admin');
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAdmin(false);
      }
    } else {
      setUser(null);
      setIsAdmin(false);
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.data?.token) {
        localStorage.setItem('token', data.data.token);
        try {
          const payload = JSON.parse(atob(data.data.token.split('.')[1]));
          setUser({ id: payload.user_id, role: payload.role });
          setIsAdmin(payload.role === 'admin');
        } catch (error) {
          console.error('Invalid token received:', error);
          return { error: 'Invalid token received' };
        }
        return { error: null };
      } else {
        return { error: data.message || 'Login failed' };
      }
    } catch (err) {
      return { error: (err as Error).message };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}