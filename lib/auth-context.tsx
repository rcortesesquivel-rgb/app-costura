import React, { createContext, useContext, useState, ReactNode } from "react";
import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";

const AUTH_STORAGE_KEY = "taller_costura_user";

export interface AuthUser {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple storage helpers that work on both web and native
function saveUserSync(user: AuthUser | null) {
  try {
    if (Platform.OS === "web") {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  } catch (e) {
    // ignore
  }
}

function loadUserSync(): AuthUser | null {
  try {
    if (Platform.OS === "web") {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthUser;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user synchronously from localStorage (no async, no loading state)
  const [user, setUser] = useState<AuthUser | null>(() => loadUserSync());
  const [isLoading] = useState(false); // Never loading - we read synchronously

  const signUp = async (email: string, password: string, name: string) => {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
      credentials: "include",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Sign up failed" }));
      throw new Error(err.error || "Sign up failed");
    }

    const data = await response.json();

    const newUser: AuthUser = {
      id: data.user?.id || 0,
      openId: data.user?.openId || `email:${email}`,
      name: data.user?.name || name,
      email: data.user?.email || email,
      role: "user",
    };

    setUser(newUser);
    saveUserSync(newUser);
  };

  const signIn = async (email: string, password: string) => {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Sign in failed" }));
      throw new Error(err.error || "Sign in failed");
    }

    const data = await response.json();

    if (data.user && data.user.isActive === "inactive") {
      throw new Error("ACCOUNT_INACTIVE");
    }

    const loggedUser: AuthUser = {
      id: data.user?.id || 0,
      openId: data.user?.openId || `email:${email}`,
      name: data.user?.name || null,
      email: data.user?.email || email,
      role: data.user?.role || "user",
    };

    setUser(loggedUser);
    saveUserSync(loggedUser);
  };

  const signOut = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // ignore
    }
    setUser(null);
    saveUserSync(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSignedIn: !!user,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
