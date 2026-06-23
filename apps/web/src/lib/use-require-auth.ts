"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";

/** Redirects to /login (preserving a return path) when not authenticated. */
export function useRequireAuth(redirect: string) {
  const { data, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !data) {
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [isPending, data, router, redirect]);

  return { session: data, ready: !isPending && !!data };
}

/** Like useRequireAuth but also requires the ADMIN role. */
export function useRequireAdmin(redirect: string) {
  const { data, isPending } = useSession();
  const router = useRouter();
  const role = (data?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    if (isPending) return;
    if (!data) {
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    } else if (role !== "ADMIN") {
      router.replace("/");
    }
  }, [isPending, data, role, router, redirect]);

  return { session: data, ready: !isPending && !!data && role === "ADMIN" };
}
