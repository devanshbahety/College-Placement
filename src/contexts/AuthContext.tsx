import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'student' | 'admin';

interface AuthContextType {
  user: { email: string; role: Role } | null;
  userRole: Role;
  login: (email: string, password: string) => Promise<boolean>;
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

// Hardcoded demo credentials (for development only)
const DEMO_EMAIL = 'pregmi_be22@thapar.edu';
const DEMO_PASSWORD = '12345678';
const DEMO_ROLE: Role = 'student';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; role: Role } | null>(null);
  const [userRole, setUserRole] = useState<Role>(DEMO_ROLE);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // (Optional) persist auth in memory across refreshes
  useEffect(() => {
    const raw = sessionStorage.getItem('auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { email: string; role: Role };
        setUser(parsed);
        setUserRole(parsed.role);
        setIsAuthenticated(true);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      sessionStorage.setItem('auth', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('auth');
    }
  }, [isAuthenticated, user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Allow ONLY this specific user
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const authedUser = { email, role: DEMO_ROLE }; // fixed role = 'student'
      setUser(authedUser);
      setUserRole(authedUser.role);
      setIsAuthenticated(true);
      return true;
    }
    // invalid credentials
    setUser(null);
    setIsAuthenticated(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setUserRole(DEMO_ROLE);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
