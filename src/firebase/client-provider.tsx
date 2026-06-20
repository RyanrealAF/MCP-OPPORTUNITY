'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigValid } from './config';
import { FirebaseProvider } from './provider';

/**
 * FirebaseClientProvider handles the initialization of Firebase services
 * exclusively on the client side after hydration.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const instances = useMemo(() => {
    // Only initialize on the client after mounting to avoid hydration mismatches
    if (!isMounted || typeof window === 'undefined' || !isFirebaseConfigValid()) {
      return null;
    }

    try {
      const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const firestore = getFirestore(firebaseApp);
      const auth = getAuth(firebaseApp);
      return { firebaseApp, firestore, auth };
    } catch (e) {
      console.error('Firebase initialization failed:', e);
      return null;
    }
  }, [isMounted]);

  // If we haven't mounted yet, we still wrap children in the Provider with null values
  // to prevent crashes during SSR, as hooks will handle the null state.
  return (
    <FirebaseProvider 
      firebaseApp={instances?.firebaseApp ?? null} 
      firestore={instances?.firestore ?? null} 
      auth={instances?.auth ?? null}
    >
      {children}
    </FirebaseProvider>
  );
};
