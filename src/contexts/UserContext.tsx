import { createContext, ReactNode, useContext } from "react";

import { useAuth } from "./AuthContext";

type AppUser = {
  userId: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
};

type UserContextType = {
  currentUser: AppUser | null;
  isLoggedIn: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { currentUser: firebaseUser } = useAuth();

  const currentUser: AppUser | null = firebaseUser
    ? {
        userId: firebaseUser.uid,
        name:
          firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
        email: firebaseUser.email || "",
        isLoggedIn: true,
      }
    : null;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoggedIn: Boolean(currentUser),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}
