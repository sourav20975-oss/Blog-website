import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, fetchMe, getStoredUser, getToken, saveSession } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getToken();
        const storedUser = await getStoredUser();
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          // Background verification
          fetchMe(storedToken)
            .then((res) => {
              if (res?.user) {
                setUser(res.user);
                saveSession(storedToken, res.user);
              }
            })
            .catch(() => {
              // If token expired
              // clearSession();
            });
        }
      } catch {
        /* storage read error */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isLoggedIn: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      loginSession: async (newToken, newUser) => {
        await saveSession(newToken, newUser);
        setToken(newToken);
        setUser(newUser);
      },
      logout: async () => {
        await clearSession();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
