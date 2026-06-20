/**
 * Firebase configuration object.
 * Values are loaded from environment variables prefixed with NEXT_PUBLIC_
 * for client-side access in Next.js.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-8574497882-c7183",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

/**
 * Validates if the minimum required configuration is present.
 */
export const isFirebaseConfigValid = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};
