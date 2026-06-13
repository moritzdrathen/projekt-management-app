import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState } from '../types';

interface AuthContextType {
  auth: AuthState | null;
  login: (data: AuthState) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Token wird im localStorage gespeichert — einfach und ausreichend für dieses Projekt.
  // In einer Produktivumgebung wäre httpOnly-Cookie sicherer (kein Zugriff per JS, XSS-resistent).
  //
  // Zur Zustandsverwaltung: React Context + useState ist für diesen Scope ausreichend.
  // Bei komplexerer Logik (z.B. mehrere Auth-Aktionen, Fehlerzustände) wäre useReducer
  // die sauberere Alternative, da Zustandsübergänge dann zentral definiert werden.
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    return token && username && role ? { token, username, role } : null;
  });

  const login = (data: AuthState) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    setAuth(data);
  };

  const logout = () => {
    localStorage.clear();
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  return ctx;
}
