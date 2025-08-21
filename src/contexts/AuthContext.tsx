import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: any;
  userRole: 'student' | 'admin';
  login: (email: string, password: string, role: 'student' | 'admin') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string, role: 'student' | 'admin'): Promise<boolean> => {
    // Mock authentication
    if (email && password) {
      setUser({ email, role });
      setUserRole(role);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};