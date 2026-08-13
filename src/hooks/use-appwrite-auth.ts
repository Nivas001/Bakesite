import { useEffect, useState } from "react";
import { getCurrentUser, signOut as appwriteSignOut, type AppwriteUser } from "@/integrations/appwrite/client";

let cachedUser: AppwriteUser | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export async function refreshAuth(): Promise<AppwriteUser | null> {
  cachedUser = await getCurrentUser();
  loaded = true;
  emit();
  return cachedUser;
}

export async function signOutEverywhere(): Promise<void> {
  await appwriteSignOut();
  cachedUser = null;
  emit();
}

/** Current Appwrite account, shared across components. */
export function useAuth() {
  const [user, setUser] = useState<AppwriteUser | null>(cachedUser);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    const listener = () => {
      setUser(cachedUser);
      setReady(true);
    };
    listeners.add(listener);
    if (!loaded) void refreshAuth();
    else listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { user, ready, signedIn: Boolean(user) };
}