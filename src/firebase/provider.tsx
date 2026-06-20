'use client';

import React, { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Toaster } from '@/components/ui/toaster';

interface FirebaseContextProps {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

// Default value must be defined to avoid hydration errors if hooks are called before mounting
const FirebaseContext = createContext<FirebaseContextProps | undefined>(undefined);

export const FirebaseProvider: React.FC<{
  children: React.ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}> = ({ children, firebaseApp, firestore, auth }) => {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, firestore, auth }}>
      <FirebaseErrorListener />
      <Toaster />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useFirestore = () => useFirebase().firestore;
export const useAuth = () => useFirebase().auth;