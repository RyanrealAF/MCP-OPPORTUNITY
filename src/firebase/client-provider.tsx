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

  // If we haven't mounted yet, render a safe wrapper to avoid hydration errors
  if (!isMounted) {
    return (
      <FirebaseProvider firebaseApp={null} firestore={null} auth={null}>
        <div className="h-screen bg-background" />
      </FirebaseProvider>
    );
  }

  // If config is missing, show a non-crashing error state
  if (!isFirebaseConfigValid()) {
    return (
      <FirebaseProvider firebaseApp={null} firestore={null} auth={null}>
        <div className="h-screen flex items-center justify-center bg-background p-6 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-xl font-code text-primary font-bold uppercase tracking-tighter">System Offline: Credentials Required</h1>
            <p className="text-xs text-muted-foreground font-body">
              Please configure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID in your environment.
            </p>
          </div>
        </div>
      </FirebaseProvider>
    );
  }

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
