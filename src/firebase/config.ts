/**
 * @fileOverview Firebase configuration for Project studio-8574497882-c7183.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: "studio-8574497882-c7183.firebaseapp.com",
  projectId: "studio-8574497882-c7183",
  storageBucket: "studio-8574497882-c7183.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

/**
 * Validates if the minimum required configuration is present.
 */
export const isFirebaseConfigValid = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};
