import React, {createContext, useContext, useEffect, useState} from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
// Note: analytics not used here

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('/api/auth/login/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: firebaseUser.email,
              id_token: idToken,
            }),
          });
          const data = await response.json();
          if (response.ok) {
            setUser(data.user);
            localStorage.setItem('authToken', idToken);
          }
        } else {
          setUser(null);
          localStorage.removeItem('authToken');
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, auth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
