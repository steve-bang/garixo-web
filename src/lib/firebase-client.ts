import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

import { env } from '@/config/env';

type FirebaseClient = {
  app: FirebaseApp;
  storage: FirebaseStorage;
};

function requiredPublicEnv(name: keyof typeof env): string {
  const value = env[name];
  if (!value) {
    throw new Error(
      `Missing required Firebase public environment variable: ${name}`
    );
  }
  return value;
}

function createFirebaseClient(): FirebaseClient {
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: requiredPublicEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
      authDomain: requiredPublicEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
      projectId: requiredPublicEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      storageBucket: requiredPublicEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      appId: requiredPublicEnv('NEXT_PUBLIC_FIREBASE_APP_ID')
    });

  return {
    app,
    storage: getStorage(app)
  };
}

const globalForFirebaseClient = globalThis as typeof globalThis & {
  __firebaseClient?: FirebaseClient;
};

export const firebaseClient =
  globalForFirebaseClient.__firebaseClient ?? createFirebaseClient();

if (!globalForFirebaseClient.__firebaseClient) {
  globalForFirebaseClient.__firebaseClient = firebaseClient;
}
