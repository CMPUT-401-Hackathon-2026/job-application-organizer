import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8di3tW-R3VLD7BDb4veklR-lZTYRevzA",
  authDomain: "hackaton-b70fc.firebaseapp.com",
  projectId: "hackaton-b70fc",
  storageBucket: "hackaton-b70fc.firebasestorage.app",
  messagingSenderId: "133209721933",
  appId: "1:133209721933:web:cfa9181426dc0d079fe004",
  measurementId: "G-X7WLWL8SH4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, auth }}>
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
