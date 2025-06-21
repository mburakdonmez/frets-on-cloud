"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { UserIcon } from "@heroicons/react/24/outline";

export function UserState() {
  const [user, setUser] = useState<null | { email?: string; id: string }>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const client = createClient();

  useEffect(() => {
    void client.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        if (!user.email) throw new Error(`Email doesn't exist for user ${user.id}`);
        setUser({ email: user.email, id: user.id });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (!session.user.email) throw new Error(`Email doesn't exist for user ${session.user.id}`);
        setUser({ email: session.user.email, id: session.user.id });
      } else setUser(null);
    });

    return () => {
      if (subscription) void subscription.unsubscribe();
    };
  }, [client]);

  if (loading) return null;

  return (
    <div className="flex w-full justify-center py-4">
      <div className="flex max-w-xs flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
        {user ? (
          <div className="flex items-center gap-2 text-sm text-white">
            <UserIcon className="h-5 w-5 text-[hsl(280,100%,70%)]" />
            <span className="font-semibold">Signed in as</span>
            <span className="truncate text-[hsl(280,100%,70%)]">{user.email ?? user.id}</span>
          </div>
        ) : (
          <button
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[hsl(280,100%,60%)] focus:ring-2 focus:ring-[hsl(280,100%,70%)] focus:ring-offset-2 focus:outline-none"
            onClick={() => router.push("/login")}
          >
            <UserIcon className="h-5 w-5" />
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}
