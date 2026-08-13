import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccess } from "@/lib/roles.functions";
import { useAuth } from "./use-appwrite-auth";

export function useIsAdmin() {
  const { user, ready: authReady } = useAuth();
  const fetchAccess = useServerFn(getMyAccess);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (!authReady) return;
    if (!user) {
      setIsAdmin(false);
      setReady(true);
      return;
    }
    fetchAccess()
      .then((access) => {
        if (active) setIsAdmin(Boolean(access.isAdmin));
      })
      .catch(() => {
        if (active) setIsAdmin(false);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [authReady, user, fetchAccess]);

  return { isAdmin, ready };
}