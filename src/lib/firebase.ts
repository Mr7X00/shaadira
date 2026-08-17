import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Safe initialization of Firebase
// This module will attempt to initialize using environment variables if the config file is missing.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID
};

let app;
let db: any = null;
let auth: any = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    const dbId = firebaseConfig.firestoreDatabaseId;
    db = dbId && dbId !== "(default)" && dbId !== "default"
      ? getFirestore(app, dbId)
      : getFirestore(app);
    auth = getAuth(app);
    console.log("✅ Firebase Client initialized successfully.");
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
} else {
  console.warn("Firebase credentials missing. Please configure VITE_FIREBASE_* environment variables.");
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Helper to handle Firestore errors gracefully in UI
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  if (errInfo.error.includes("permission-denied")) {
    console.warn(`[Firestore] Permission Denied for ${operationType} on ${path}. Check security rules.`);
  } else {
    console.error("Firestore Error (Handled): ", JSON.stringify(errInfo));
  }
  // Not throwing to prevent React runtime app crashes on security rules/permission errors
}

export { db, auth };
