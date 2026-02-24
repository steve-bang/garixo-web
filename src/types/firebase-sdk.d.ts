declare module 'firebase-admin/app' {
  export type App = unknown;
  export function cert(input: unknown): unknown;
  export function getApps(): App[];
  export function initializeApp(options?: unknown): App;
}

declare module 'firebase-admin/firestore' {
  export const FieldValue: {
    increment: (value: number) => unknown;
    serverTimestamp: () => unknown;
  };

  export type Firestore = {
    runTransaction: <T>(
      updateFunction: (transaction: unknown) => Promise<T>
    ) => Promise<T>;
    collection: (path: string) => {
      doc: (id?: string) => {
        id: string;
        set: (data: unknown, options?: unknown) => Promise<void>;
        get: () => Promise<{
          exists: boolean;
          id: string;
          data: () => unknown;
        }>;
        delete: () => Promise<void>;
        collection: (name: string) => {
          doc: (id?: string) => {
            id: string;
            set: (data: unknown, options?: unknown) => Promise<void>;
            get: () => Promise<{
              exists: boolean;
              id: string;
              data: () => unknown;
            }>;
            delete: () => Promise<void>;
            collection: (name: string) => {
              doc: (id?: string) => {
                id: string;
                set: (data: unknown, options?: unknown) => Promise<void>;
                get: () => Promise<{
                  exists: boolean;
                  id: string;
                  data: () => unknown;
                }>;
                delete: () => Promise<void>;
              };
              get: () => Promise<{
                docs: Array<{ id: string; data: () => unknown }>;
              }>;
            };
          };
          where: (
            field: string,
            op: string,
            value: unknown
          ) => {
            limit: (count: number) => {
              get: () => Promise<{
                docs: Array<{ id: string; data: () => unknown }>;
                empty: boolean;
              }>;
            };
          };
          get: () => Promise<{
            docs: Array<{ id: string; data: () => unknown }>;
          }>;
        };
      };
      where: (
        field: string,
        op: string,
        value: unknown
      ) => {
        limit: (count: number) => {
          get: () => Promise<{
            docs: Array<{ id: string; data: () => unknown }>;
            empty: boolean;
          }>;
        };
      };
      get: () => Promise<{ docs: Array<{ id: string; data: () => unknown }> }>;
    };
  };

  export function getFirestore(app?: unknown): Firestore;
}

declare module 'firebase-admin/auth' {
  export type UserRecord = {
    uid: string;
    email?: string | null;
    emailVerified?: boolean;
    metadata: {
      creationTime?: string;
      lastSignInTime?: string;
    };
  };

  export type Auth = {
    createUser: (input: unknown) => Promise<UserRecord>;
    getUserByEmail: (email: string) => Promise<UserRecord>;
    getUser: (uid: string) => Promise<UserRecord>;
    updateUser: (uid: string, input: unknown) => Promise<UserRecord>;
    createCustomToken: (uid: string) => Promise<string>;
  };

  export function getAuth(app?: unknown): Auth;
}

declare module 'firebase-admin/storage' {
  export type Storage = {
    bucket: (name?: string) => {
      file: (path: string) => {
        save: (buffer: Buffer, options?: unknown) => Promise<void>;
        exists: () => Promise<[boolean]>;
        delete: () => Promise<void>;
        getSignedUrl: (options: unknown) => Promise<[string]>;
      };
      name: string;
    };
  };

  export function getStorage(app?: unknown): Storage;
}

declare module 'firebase/app' {
  export type FirebaseApp = unknown;
  export function getApps(): FirebaseApp[];
  export function initializeApp(options: unknown): FirebaseApp;
}

declare module 'firebase/storage' {
  export type FirebaseStorage = unknown;
  export function getStorage(app?: unknown): FirebaseStorage;
}
