/**
 * @fileOverview Firebase configuration for Project studio-8574497882-c7183.
 */

export const firebaseConfig = {
  apiKey: "AIzaSyC325HsaJMBwXtEXdeTgXvaaFMqsEUNqJU",
  authDomain: "studio-8574497882-c7183.firebaseapp.com",
  projectId: "studio-8574497882-c7183",
  storageBucket: "studio-8574497882-c7183.firebasestorage.app",
  messagingSenderId: "446413147215",
  appId: "1:446413147215:web:ba90f69ea3fa1dec142e3a"
};

/**
 * Validates if the minimum required configuration is present.
 */
export const isFirebaseConfigValid = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};
