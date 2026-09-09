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

// ── Fail-closed: no silent dev user. If Firebase is not configured,
// the app stays logged out and the login screen explains why. ──
export const IS_AUTH_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
);

const AUTH_NOT_CONFIGURED =
  "Authentification non configurée — contactez le support.";

let auth: ReturnType<typeof getAuth> | null = null;

if (IS_AUTH_CONFIGURED) {
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

const googleProvider = IS_AUTH_CONFIGURED ? new GoogleAuthProvider() : null;
const appleProvider = IS_AUTH_CONFIGURED
  ? (() => {
      const p = new OAuthProvider("apple.com");
      p.addScope("email");
      p.addScope("name");
      return p;
    })()
  : null;

// ── Demo mode: opt-in fake user when Firebase is NOT configured. ──
// Never active in production: requires BOTH the demo flag AND missing config.
const IS_DEMO = process.env.NEXT_PUBLIC_ARSHOT_DEMO === "true";
export const IS_DEMO_AUTH = IS_DEMO && !IS_AUTH_CONFIGURED;

const DEMO_USER = {
  uid: "demo-user",
  email: "demo@arshot.fr",
  displayName: "Démo ARShot",
  emailVerified: true,
  isAnonymous: false,
  getIdToken: async () => "demo",
} as unknown as User;

function requireAuth() {
  if (!auth) throw new Error(AUTH_NOT_CONFIGURED);
  return auth;
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(requireAuth(), email, password);
}

export async function signInWithGoogle() {
  return signInWithPopup(requireAuth(), googleProvider!);
}

export async function signInWithApple() {
  return signInWithPopup(requireAuth(), appleProvider!);
}

export async function signOut() {
  if (!auth) return;
  return firebaseSignOut(auth);
}

export async function getIdToken(): Promise<string | null> {
  if (IS_DEMO_AUTH) return "demo";
  const user = auth?.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (IS_DEMO_AUTH) {
    const id = setTimeout(() => callback(DEMO_USER), 0);
    return () => clearTimeout(id);
  }
  if (!auth) {
    // Not configured → immediately report logged out (AppShell redirects to /login)
    const id = setTimeout(() => callback(null), 0);
    return () => clearTimeout(id);
  }
  return onAuthStateChanged(auth, callback);
}

export { auth };
export type { User };
