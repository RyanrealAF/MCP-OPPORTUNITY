'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigValid } from './config';
import { FirebaseProvider } from './provider';

/**
 * FirebaseClientProvider handles the initialization of Firebase services.
 * It ensures the provider is always present to avoid hydration errors,
 * even if services are null before client-side mount.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const instances = useMemo(() => {
    // Return nulls during SSR or before validation
    if (!isMounted || typeof window === 'undefined' || !isFirebaseConfigValid()) {
      return { firebaseApp: null, firestore: null, auth: null };
    }

    try {
      const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const firestore = getFirestore(firebaseApp);
      const auth = getAuth(firebaseApp);
      return { firebaseApp, firestore, auth };
    } catch (e) {
      // Fail gracefully and return nulls
      return { firebaseApp: null, firestore: null, auth: null };
    }
  }, [isMounted]);

  return (
    <FirebaseProvider 
      firebaseApp={instances.firebaseApp} 
      firestore={instances.firestore} 
      auth={instances.auth}
    >
      {children}
    </FirebaseProvider>
  );
};
