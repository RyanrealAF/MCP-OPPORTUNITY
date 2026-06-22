'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * Hook to manage and provide the current authenticated user.
 * Enhanced to handle initialization delays more gracefully.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not available (e.g., config missing), we stop loading
    if (!auth) {
      console.warn('Firebase Auth service not available for useUser hook.');
      setLoading(false);
      return;
    }

    // Set up the authentication state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('onAuthStateChanged error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
