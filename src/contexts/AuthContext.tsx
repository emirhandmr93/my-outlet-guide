import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
User,
createUserWithEmailAndPassword,
onAuthStateChanged,
signInWithCredential,
signInWithEmailAndPassword,
signOut,
GoogleAuthProvider,
} from "firebase/auth";

import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { auth } from "../firebase/config";

// GoogleSignin.configure({
// webClientId:
// "763605869867-3oh2d4no1rbkckicm412iejjptmugirn.apps.googleusercontent.com",
// });

type AuthContextType = {
currentUser: User | null;
isAuthenticated: boolean;
loading: boolean;

loginWithEmail: (
email: string,
password: string
) => Promise<void>;

registerWithEmail: (
email: string,
password: string
) => Promise<void>;

loginWithGoogle: () => Promise<void>;

logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
undefined
);

export function AuthProvider({
children,
}: {
children: ReactNode;
}) {
const [currentUser, setCurrentUser] =
useState<User | null>(null);

const [loading, setLoading] = useState(true);

useEffect(() => {
const unsubscribe = onAuthStateChanged(
auth,
(user) => {
setCurrentUser(user);
setLoading(false);
}
);

return unsubscribe;
}, []);

async function loginWithEmail(
email: string,
password: string
) {
await signInWithEmailAndPassword(
auth,
email,
password
);
}

async function registerWithEmail(
email: string,
password: string
) {
await createUserWithEmailAndPassword(
auth,
email,
password
);
}

async function loginWithGoogle() {
await GoogleSignin.hasPlayServices();

const result = await GoogleSignin.signIn();

const idToken = result.data?.idToken;

if (!idToken) {
throw new Error("Google token not found.");
}

const credential =
GoogleAuthProvider.credential(idToken);

await signInWithCredential(
auth,
credential
);
}

async function logout() {
await signOut(auth);
}

return (
<AuthContext.Provider
value={{
currentUser,
isAuthenticated: Boolean(currentUser),
loading,
loginWithEmail,
registerWithEmail,
loginWithGoogle,
logout,
}}
>
{children}
</AuthContext.Provider>
);
}

export function useAuth() {
const context = useContext(AuthContext);

if (!context) {
throw new Error(
"useAuth must be used inside AuthProvider"
);
}

return context;
}