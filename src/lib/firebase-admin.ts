import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

import { env } from '@/config/env';

type FirebaseAdmin = {
  app: App;
  auth: Auth;
  db: Firestore;
  storage: Storage;
};

function requiredEnv(name: keyof typeof env): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required Firebase environment variable: ${name}`);
  }
  return value;
}

function createFirebaseAdmin(): FirebaseAdmin {
  const projectId = requiredEnv('FIREBASE_PROJECT_ID');
  const clientEmail = requiredEnv('FIREBASE_CLIENT_EMAIL');
  const privateKey = requiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
  const storageBucket = requiredEnv('FIREBASE_STORAGE_BUCKET');

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      }),
      storageBucket
    });

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app)
  };
}

const globalForFirebase = globalThis as typeof globalThis & {
  __firebaseAdmin?: FirebaseAdmin;
};

export const firebaseAdmin =
  globalForFirebase.__firebaseAdmin ?? createFirebaseAdmin();

if (!globalForFirebase.__firebaseAdmin) {
  globalForFirebase.__firebaseAdmin = firebaseAdmin;
}
