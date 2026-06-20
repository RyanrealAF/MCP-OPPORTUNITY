/**
 * @fileOverview Firebase configuration for Project studio-8574497882-c7183.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-8574497882-c7183.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-8574497882-c7183",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-8574497882-c7183.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

/**
 * Validates if the minimum required configuration is present.
 */
export const isFirebaseConfigValid = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};
