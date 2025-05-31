import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth state
    const timer = setTimeout(() => {
      setUser({ email: 'user@example.com', role: 'user' });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const value = {
    user,
    loading,
    signIn: async () => {},
    signOut: async () => {},
    signUp: async () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
