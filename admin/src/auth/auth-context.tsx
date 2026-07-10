import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CONFIG } from 'src/config-global';

type UserType = {
  id: string;
  name: string;
  email: string;
  user_type: string;
};

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          
          // Verify token and fetch latest user info
          const response = await fetch(`${CONFIG.apiUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const latestUser = await response.json();
            setUser(latestUser);
            localStorage.setItem('user', JSON.stringify(latestUser));
          } else {
            // Token is invalid/expired
            logout();
          }
        } catch (error) {
          console.error('Error during initial auth verification:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${CONFIG.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Invalid credentials');
    }

    const { access_token, user: loggedUser } = await response.json();

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
