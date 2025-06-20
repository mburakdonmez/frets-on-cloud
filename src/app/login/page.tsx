"use client";
import { useState } from "react";
import { createClient } from "@/supabase/client";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import { useRouter } from "next/navigation";

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800" aria-live="polite">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function signup() {
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) return void setError(error.message);
    const user = data.user;
    if (!user) return void setError("Couldn't receive user");
    return user;
  }

  async function login() {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      if (error.code === "email_not_confirmed") setShowResend(true);
      else setShowResend(false);
      return;
    }
    setShowResend(false);
    const user = data.user;
    if (!user) return void setError("Couldn't receive user");
    router.push("/");
    return user;
  }

  async function submit() {
    setPending(true);
    if (isLogin) await login();
    else await signup();
    setPending(false);
  }

  async function resendEmail() {
    setPending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setPending(false);
    if (error) setError(error.message);
    else setError("Confirmation email resent. Please check your inbox.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
        </div>
        <form
          className={`mt-8 space-y-6 ${pending ? "pointer-events-none opacity-60" : ""}`}
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
              />
            </div>
          </div>

          {error !== "" && <ErrorMessage message={error} />}
          {showResend && (
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                className="cursor-pointer text-sm text-indigo-600 hover:underline"
                onClick={resendEmail}
                disabled={pending}
              >
                Resend confirmation email
              </button>
            </div>
          )}
          <div className="space-y-4">
            <button
              disabled={pending}
              type="submit"
              className="group relative flex w-full cursor-pointer justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              {pending ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner />
                  {isLogin ? "Signing in..." : "Registering..."}
                </span>
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Register"
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="group relative flex w-full cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
              disabled={pending}
            >
              {isLogin ? "Need an account? Register" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
