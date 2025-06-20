"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { Database } from "@/database.types";

export const createClient = () =>
  createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export function ProtectedRoute(props: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const client = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await client.auth.getUser();
        if (!user) return router.replace("/login");
        setIsLoading(false);
      } catch (error) {
        console.error("Error verifying authentication:", error);
        router.replace("/login");
      }
    };

    void checkAuth();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      if (subscription) void subscription.unsubscribe();
    };
  }, [router, client.auth]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{props.children}</>;
}
