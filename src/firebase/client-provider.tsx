'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigValid } from './config';
import { FirebaseProvider } from './provider';

/**
 * FirebaseClientProvider handles the initialization of Firebase services
 * exclusively on the client side.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const instances = useMemo(() => {
    // Defer initialization until we are on the client and have a valid config
    if (typeof window === 'undefined' || !isFirebaseConfigValid()) {
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

  // If mounted but no instances, it means the config is missing or invalid
  if (isMounted && !instances && isFirebaseConfigValid()) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-xl font-code text-destructive font-bold uppercase tracking-tighter">System Error: Initialization Failed</h1>
          <p className="text-sm text-muted-foreground font-body">
            Firebase failed to initialize. Check the console for more details.
          </p>
        </div>
      </div>
    );
  }

  // If config is explicitly missing, show a specific error
  if (isMounted && !isFirebaseConfigValid()) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-xl font-code text-destructive font-bold uppercase tracking-tighter">System Error: Missing Credentials</h1>
          <p className="text-sm text-muted-foreground font-body">
            The Firebase configuration is missing. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set.
          </p>
        </div>
      </div>
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
