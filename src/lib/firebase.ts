import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

// ── Dev mock mode when Firebase is not configured ──
export const IS_MOCK = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const MOCK_USER = {
  uid: "dev-user-001",
  email: "dev@arshot.fr",
  displayName: "Dev User",
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: "",
  tenantId: null,
  phoneNumber: null,
  providerId: "firebase",
  delete: () => Promise.resolve(),
  getIdToken: () => Promise.resolve("mock-token-dev"),
  getIdTokenResult: () => Promise.resolve({} as never),
  reload: () => Promise.resolve(),
  toJSON: () => ({}),
} as unknown as User;

let auth: ReturnType<typeof getAuth> | null = null;

if (!IS_MOCK) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
}

const googleProvider = IS_MOCK ? null : new GoogleAuthProvider();
const appleProvider = IS_MOCK ? null : (() => {
  const p = new OAuthProvider("apple.com");
  p.addScope("email");
  p.addScope("name");
  return p;
})();

export async function signInWithEmail(email: string, password: string) {
  if (IS_MOCK) return { user: MOCK_USER } as never;
  return signInWithEmailAndPassword(auth!, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  if (IS_MOCK) return { user: MOCK_USER } as never;
  return createUserWithEmailAndPassword(auth!, email, password);
}

export async function signInWithGoogle() {
  if (IS_MOCK) return { user: MOCK_USER } as never;
  return signInWithPopup(auth!, googleProvider!);
}

export async function signInWithApple() {
  if (IS_MOCK) return { user: MOCK_USER } as never;
  return signInWithPopup(auth!, appleProvider!);
}

export async function signOut() {
  if (IS_MOCK) return;
  return firebaseSignOut(auth!);
}

export async function getIdToken(): Promise<string | null> {
  if (IS_MOCK) return "mock-token-dev";
  const user = auth?.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (IS_MOCK) {
    // Simulate async auth ready
    setTimeout(() => callback(MOCK_USER), 100);
    return () => {};
  }
  return onAuthStateChanged(auth!, callback);
}

export { auth };
export type { User };
