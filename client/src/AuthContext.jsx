import { createContext, useContext, useMemo, useState } from 'react';
import { clearSession, getStoredUser, getToken, saveSession } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getStoredUser());

  const value = useMemo(
    () => ({
      user,
      token,
      isLoggedIn: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      loginSession: (newToken, newUser) => {
        saveSession(newToken, newUser);
        setToken(newToken);
        setUser(newUser);
      },
      logout: () => {
        clearSession();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
